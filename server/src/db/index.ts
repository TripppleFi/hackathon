import { createClient, type Client } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import { config } from "../lib/config"
import * as schema from "./schema"

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined
}

export const client =
  globalForDb.client ?? createClient({ url: config.DATABASE_URL })
if (config.NODE_ENV !== "production") globalForDb.client = client

export const db = drizzle(client, { schema })
