import { relations } from "drizzle-orm";
import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { metaPageInsights } from "./metaPageInsights";

export const metaPageInsightMetrics = mysqlTable("meta_page_insight_metrics", {
  metricId: int("metric_id").primaryKey(),
  insightId: int("insight_id"),
  name: varchar("name", { length: 255 }),
  period: varchar("name", { length: 30 }),
  value: int("value"),
  endTime: varchar("end_time", { length: 100 }),
  title: varchar("title", { length: 150 }),
  description: varchar("description", { length: 300 }),
});

export const metaPageInsightsRelations = relations(
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
