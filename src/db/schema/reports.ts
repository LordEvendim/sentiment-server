import { relations } from "drizzle-orm";
import { int, mysqlTable, text } from "drizzle-orm/mysql-core";

import { users } from "./users";

export const reports = mysqlTable("reports", {
  reportId: int("report_id").primaryKey().autoincrement(),
  createdAd: int("crated_at").notNull(),
  data: text("data").notNull(),
  ownerId: int("owner_id"),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  owner: one(users),
}));

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
