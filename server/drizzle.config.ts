import { type Config } from "drizzle-kit"

import { config } from "./src/lib/config"

export default {
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  driver: "turso",
  verbose: config.NODE_ENV === "development",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
} satisfies Config
