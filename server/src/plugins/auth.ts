import Elysia from "elysia"
import { bearer } from "@elysiajs/bearer"
import * as jose from "jose"

import { config } from "../lib/config"
import { errorsPlugin } from "./errors"
import { setupPlugin } from "./setup"

export const authPlugin = new Elysia({ name: "@plugin/auth" })
  .use(bearer())
  .use(setupPlugin)
  .use(errorsPlugin)
  .derive({ as: "global" }, async ({ db, bearer, httpErrors }) => {
    const { payload } = await jose.jwtVerify(
      String(bearer),
      new TextEncoder().encode(config.APP_SECRET),
    )

    const user = await db.query.users.findFirst({
      where(fields, ops) {
        return ops.eq(fields.id, String(payload.sub))
      },
    })

    return {
      get session() {
        return {
          get user() {
            if (!user) throw httpErrors.Unauthorized()
            return user
          },
          async validate() {
            if (!bearer || !user) {
              throw httpErrors.Unauthorized()
            }
          },
        }
      },
    }
  })
  .macro(({ onBeforeHandle }) => {
    return {
      guard(value: "guest" | "auth") {
        if (value === "auth") {
          onBeforeHandle(async ({ session }) => session.validate())
        }

        if (value === "guest") {
          onBeforeHandle(async ({ bearer, httpErrors }) => {
            if (bearer) throw httpErrors.Forbidden()
          })
        }
      },
    }
  })
