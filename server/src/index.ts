import Elysia from "elysia"
import { cors } from "@elysiajs/cors"
import { serverTiming } from "@elysiajs/server-timing"
import { compression } from "elysia-compression"
import { helmet } from "elysia-helmet"
import { requestID } from "elysia-requestid"

import { config } from "./lib/config"
import { generateId as uuid } from "./lib/utils"
import { cardRoutes } from "./router/cards"
import { loginRoutes } from "./router/login"

export const server = new Elysia({
  precompile: config.NODE_ENV === "production",
})
  .use(cors())
  .use(helmet())
  .use(requestID({ uuid }))
  .use(serverTiming())
  .use(compression())
  .use(loginRoutes)
  .use(cardRoutes)

server.listen(config.PORT, ({ hostname, port }) => {
  const scheme = config.NODE_ENV === "production" ? "https" : "http"
  console.log(
    `${config.APP_NAME} is running at ${scheme}://${hostname}:${port}`,
  )
})

export type Server = typeof server
