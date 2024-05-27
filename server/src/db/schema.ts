import { sql } from "drizzle-orm"
import {
  sqliteTableCreator,
  text,
  unique,
  type SQLiteTableFn,
} from "drizzle-orm/sqlite-core"

import { generateId } from "../lib/utils"

const id = text("id").notNull().primaryKey().$default(generateId)
const createdAt = text("created_at")
  .notNull()
  .default(sql`(CURRENT_TIMESTAMP)`)

const createTable: SQLiteTableFn = (name, columns, config) => {
  const creator = sqliteTableCreator(name => `api_${name}`)
  return creator(name, { id, ...columns, createdAt }, config)
}

export const users = createTable(
  "users",
  {
    id,
    provider: text("provider").notNull(),
    providerId: text("provider_id").notNull(),
    address: text("address").notNull().unique(),
    salt: text("salt").notNull().unique(),
  },
  t => ({ composite: unique().on(t.provider, t.providerId) }),
)

export const cards = createTable("cards", {
  id,
  createdAt,
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  label: text("label").notNull(),
  address: text("address").notNull(),
  privateKey: text("private_key").notNull(),
  nameOnCard: text("name_on_card"),
  accountNumber: text("account_number"),
  expiry: text("expiry"),
  securityCode: text("security_code"),
  status: text("status", { enum: ["inactive", "pending", "active"] })
    .notNull()
    .default("inactive"),
})
