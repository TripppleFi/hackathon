import { Elysia, t } from "elysia"
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519"

import { cards } from "../db/schema"
import { authPlugin } from "../plugins/auth"
import { setupPlugin } from "../plugins/setup"

const newValidator = t.Object({ label: t.String() })

export const cardRoutes = new Elysia({ name: "@router/cards", prefix: "cards" })
  .use(authPlugin)
  .use(setupPlugin)
  .guard({ guard: "auth" }, app =>
    app
      .get("/", async ({ db, session }) => {
        return db.query.cards.findMany({
          where(fields, ops) {
            return ops.eq(fields.userId, session.user.id)
          },
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
      ),
  )
