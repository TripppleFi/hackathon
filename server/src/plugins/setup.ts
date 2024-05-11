import Elysia from "elysia"

import { db } from "../db"
import { errorsPlugin } from "./errors"

export const setupPlugin = new Elysia({ name: "@plugin/setup" })
  .use(errorsPlugin)
  .decorate({
    db,
  })
