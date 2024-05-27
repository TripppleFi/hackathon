import { Elysia, t } from "elysia"
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography"
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519"
import { TransactionBlock } from "@mysten/sui.js/transactions"
import BigNumber from "bignumber.js"
import { eq } from "drizzle-orm"

import { cards } from "../db/schema"
import { getSuiClient } from "../lib/sui"
import { authPlugin } from "../plugins/auth"
import { setupPlugin } from "../plugins/setup"

const newValidator = t.Object({ label: t.String() })
const fundValidator = t.Object({
  address: t.String({ minLength: 66, maxLength: 66 }),
})

const withdrawValidator = t.Object({
  id: t.String(),
  amount: t.Number({ minimum: 0 }),
})

export const cardRoutes = new Elysia({ name: "@router/cards", prefix: "cards" })
  .use(authPlugin)
  .use(setupPlugin)
  .guard({ guard: "auth" }, app =>
    app
      .get("/", async ({ db, session }) => {
        return db.query.cards.findMany({
          orderBy: (fields, ops) => ops.desc(fields.createdAt),
          where: (fields, ops) => ops.eq(fields.userId, session.user.id),
        })
      })
      .post(
        "/",
        async ({ body, db, session }) => {
          const kp = Ed25519Keypair.generate()
          return db.insert(cards).values({
            label: body.label,
            userId: session.user.id,
            address: kp.getPublicKey().toSuiAddress(),
            privateKey: kp.getSecretKey(),
          })
        },
        { body: newValidator },
      )
      .post(
        "/fund",
        async ({ body, db, session, httpErrors }) => {
          const suiClient = getSuiClient()
          const card = await db.query.cards.findFirst({
            where(fields, operators) {
              return operators.eq(fields.address, body.address)
            },
          })

          if (!card || card.userId !== session.user.id) {
            throw httpErrors.Forbidden()
          }

          const balance = await suiClient.getBalance({
            owner: body.address,
          })

          if (Number(balance.totalBalance) > 0 && card.status === "inactive") {
            await db
              .update(cards)
              .set({ status: "pending" })
              .where(eq(cards.id, card.id))
          }

          return { ok: true }
        },
        { body: fundValidator },
      )
      .post(
        "/withdraw",
        async ({ body, db, session, httpErrors }) => {
          const suiClient = getSuiClient()
          const card = await db.query.cards.findFirst({
            where(fields, operators) {
              return operators.and(
                operators.eq(fields.id, body.id),
                operators.eq(fields.userId, session.user.id),
              )
            },
          })

          if (!card) {
            throw httpErrors.BadRequest()
          }

          const kp = Ed25519Keypair.fromSecretKey(
            decodeSuiPrivateKey(card.privateKey).secretKey,
          )

          const txb = new TransactionBlock()
          const amount = new BigNumber(body.amount)
          const [coin] = txb.splitCoins(txb.gas, [
            txb.pure(amount.multipliedBy(1e9).toNumber()),
          ])

          txb.transferObjects([coin], txb.pure(session.user.address))
          txb.setSender(card.address)

          const { bytes, signature } = await txb.sign({
            client: suiClient,
            signer: kp,
          })

          return suiClient.executeTransactionBlock({
            signature,
            transactionBlock: bytes,
            requestType: "WaitForLocalExecution",
          })
        },
        { body: withdrawValidator },
      ),
  )
