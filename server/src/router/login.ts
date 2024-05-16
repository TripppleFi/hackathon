import { Elysia, t } from "elysia"
import { Ed25519PublicKey } from "@mysten/sui.js/keypairs/ed25519"
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  getZkLoginSignature,
  jwtToAddress,
} from "@mysten/zklogin"
import { ip } from "address"
import * as jose from "jose"
import { Result } from "oxide.ts"

import { users } from "../db/schema"
import { config } from "../lib/config"
import { getSuiClient } from "../lib/sui"
import { safeFetch } from "../lib/utils"
import { setupPlugin } from "../plugins/setup"

enum Platform {
  google = "google",
  twitch = "twitch",
}

const paramsValidator = t.Object({
  platform: t.Enum(Platform),
})

const ceremonyValidator = t.Object({
  ephemeralPublicKey: t.String(),
})

const proofValidator = t.Composite([
  ceremonyValidator,
  t.Object({
    token: t.String(),
    maxEpoch: t.Number(),
    randomness: t.String(),
  }),
])

export const loginRoutes = new Elysia({ name: "@router/auth", prefix: "auth" })
  .use(setupPlugin)
  .get(
    "/redirect/:platform",
    ({ query: { nonce }, redirect, params: { platform }, httpErrors }) => {
      const app =
        config.NODE_ENV === "development"
          ? `exp://${ip()}:8081/--/login`
          : `com.supple.fi://login`

      const params = new URLSearchParams({
        nonce,
        scope: "openid",
        response_type: "id_token",
        redirect_uri: `https://fragdirector.fly.dev/${app}`,
      })

      let url: string
      switch (platform) {
        case Platform.google:
          url = `https://accounts.google.com/o/oauth2/v2/auth`
          params.set("client_id", config.GOOGLE_CLIENT_ID)
          break
        case Platform.twitch:
          url = `https://id.twitch.tv/oauth2/authorize`
          params.set("client_id", config.TWITCH_CLIENT_ID)
          params.set("login_type", "login")
          break
        default:
          throw httpErrors.NotFound()
      }

      const dest = new URL(url)
      dest.search = params.toString()
      return redirect(dest.toString())
    },
    {
      params: paramsValidator,
      query: t.Object({ nonce: t.String() }),
    },
  )
  .post(
    "/ceremony",
    async ({ body }) => {
      const system = await getSuiClient().getLatestSuiSystemState()
      const epoch = Number(system.epoch)
      const maxEpoch = epoch + 30
      const randomness = generateRandomness()
      const pk = new Ed25519PublicKey(body.ephemeralPublicKey)
      const nonce = generateNonce(pk, maxEpoch, BigInt(randomness))
      return { nonce, epoch, maxEpoch, randomness }
    },
    { body: ceremonyValidator },
  )
  .post(
    "/login",
    async ({ body, httpErrors, db }) => {
      const jwt = jose.decodeJwt(body.token)
      if (!jwt.sub || !jwt.iss) {
        throw httpErrors.BadRequest()
      }

      const { maxEpoch, randomness, ephemeralPublicKey } = body
      let user = await db.query.users.findFirst({
        where(fields, ops) {
          return ops.and(
            ops.eq(fields.provider, jwt.iss ?? ""),
            ops.eq(fields.providerId, jwt.sub ?? ""),
          )
        },
      })

      if (!user) {
        const salt = generateRandomness()
        user = await db
          .insert(users)
          .values({
            salt,
            provider: jwt.iss,
            providerId: jwt.sub,
            address: jwtToAddress(body.token, BigInt(salt)),
          })
          .returning()
          .get()
      }

      const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
        new Ed25519PublicKey(ephemeralPublicKey),
      )

      const proofs = await safeFetch<PartialSignature>(config.SUI_PROVER_URL, {
        method: "POST",
        body: {
          maxEpoch,
          extendedEphemeralPublicKey,
          jwtRandomness: randomness,
          salt: user.salt,
          jwt: body.token,
          keyClaimName: "sub",
        },
      })

      if (!proofs || proofs.isErr()) {
        throw httpErrors.Internal()
      }

      const token = await Result.safe(
        new jose.SignJWT({
          sub: user.id,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("30 days")
          .sign(new TextEncoder().encode(config.APP_SECRET)),
      )

      if (token.isErr()) {
        throw httpErrors.Internal()
      }

      return {
        maxEpoch,
        salt: user.salt,
        sub: String(jwt.sub),
        aud: String(jwt.aud),
        token: token.unwrap(),
        proofs: proofs.unwrap(),
        address: user.address,
      }
    },
    { body: proofValidator },
  )

type PartialSignature = Omit<
  Parameters<typeof getZkLoginSignature>["0"]["inputs"],
  "addressSeed"
>
