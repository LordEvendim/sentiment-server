import { relations } from "drizzle-orm";
import { bigint, date, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { metaPages } from "./metaPages";

export const metaInsightsMetrics = mysqlTable("meta_insights_metrics", {
  id: int("id").autoincrement().primaryKey(),
  metricId: varchar("metric_id", { length: 256 }).notNull(), // metricId is used to get metrics details, metrics, etc.
  value: int("value").notNull(),
  createdAt: date("created_at").notNull(),
  period: int("period").notNull(), // in days: 0 -> lifetime
  sourceId: bigint("source_id", { mode: "number" }).notNull(),
  integrationId: bigint("integration_id", { mode: "number" }).notNull(),
});

export const metaInsightsMetricsRelations = relations(
  metaInsightsMetrics,
  ({ one }) => ({
    source: one(metaPages, {
      fields: [metaInsightsMetrics.sourceId, metaInsightsMetrics.integrationId],
      references: [metaPages.pageId, metaPages.integrationId],
    }),
  })
);

export type MetaInsightsMetric = typeof metaInsightsMetrics.$inferSelect;
export type NewMetaInsightsMetric = typeof metaInsightsMetrics.$inferInsert;
