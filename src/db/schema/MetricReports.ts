import { relations } from "drizzle-orm";
import {
  date,
  datetime,
  int,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

import { users } from "./users";

export const metricReports = mysqlTable("metric_reports", {
  reportId: int("report_id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull(),
  createdAt: datetime("created_at").notNull(),
  timeframe: varchar("timeframe", { length: 30 }).notNull(),
  until: date("until").notNull(),
  data: text("data").notNull(),
  ownerId: int("owner_id").notNull(),
});

export const reportsRelations = relations(metricReports, ({ one }) => ({
  owner: one(users, {
    fields: [metricReports.ownerId],
    references: [users.id],
  }),
}));

export type MetricReport = typeof metricReports.$inferSelect;
export type NewMetricReport = typeof metricReports.$inferInsert;
