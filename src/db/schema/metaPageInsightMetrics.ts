import { relations } from "drizzle-orm";
import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { metaPageInsights } from "./metaPageInsights";

export const metaPageInsightMetrics = mysqlTable("meta_page_insight_metrics", {
  metricId: int("metric_id").autoincrement().primaryKey(),
  insightId: int("insight_id"),
  name: varchar("name", { length: 255 }).notNull(),
  period: varchar("period", { length: 30 }).notNull(),
  value: int("value").notNull(),
  endTime: varchar("end_time", { length: 100 }).notNull(),
  title: varchar("title", { length: 150 }).notNull(),
  description: varchar("description", { length: 300 }).notNull(),
});

export const metaPageInsightsMetricsRelations = relations(
  metaPageInsightMetrics,
  ({ one }) => ({
    insightId: one(metaPageInsights, {
      fields: [metaPageInsightMetrics.insightId],
      references: [metaPageInsights.insightId],
    }),
  })
);

export type MetaPageInsightMetric = typeof metaPageInsightMetrics.$inferSelect;
export type NewMetaPageInsightMetric =
  typeof metaPageInsightMetrics.$inferInsert;
