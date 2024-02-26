import { relations } from "drizzle-orm";
import { bigint, int, mysqlTable, text } from "drizzle-orm/mysql-core";

import { users } from "./users";

export const reports = mysqlTable("reports", {
  reportId: int("report_id").primaryKey().autoincrement(),
  createdAd: bigint("crated_at", { mode: "number" }).notNull(),
  data: text("data").notNull(),
  ownerId: int("owner_id"),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  owner: one(users, {
    fields: [reports.ownerId],
    references: [users.id],
  }),
}));

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
