import {
  bigint,
  datetime,
  int,
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";

export const metaApiUsage = mysqlTable("meta_api_usage", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 128 }).notNull(),
  createdAt: datetime("created_at").notNull(),
  callUsage: int("call_usage").notNull(),
  userId: int("user_id"),
  accountId: bigint("account_id", { mode: "number" }),
});

export type MetaApiUsage = typeof metaApiUsage.$inferSelect;
export type NewMetaApiUsage = typeof metaApiUsage.$inferInsert;
