import { sql, type BuildColumns } from "drizzle-orm"
import {
  sqliteTable,
  text,
  unique,
  type SQLiteColumnBuilderBase,
  type SQLiteTableExtraConfig,
} from "drizzle-orm/sqlite-core"

import { generateId } from "../lib/utils"

export const users = createTable(
  "user",
  {
    provider: text("provider").notNull(),
    providerId: text("provider_id").notNull(),
    address: text("address").notNull().unique(),
    salt: text("salt").notNull().unique(),
  },
  t => ({ composite: unique().on(t.provider, t.providerId) }),
)

function createTable<
  TTableName extends string,
  TColumnsMap extends Record<string, SQLiteColumnBuilderBase>,
>(
  name: TTableName,
  columns: TColumnsMap,
  extraConfig?: (
    self: BuildColumns<TTableName, TColumnsMap, "sqlite">,
  ) => SQLiteTableExtraConfig,
) {
  return sqliteTable(
    name,
    {
      id: text("id").notNull().primaryKey().$default(generateId),
      ...columns,
      createdAt: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    },
    extraConfig,
  )
}
