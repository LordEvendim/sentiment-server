import { relations } from "drizzle-orm";
import { bigint, date, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { googleAnalyticsPages } from "./googleAnalyticsPages";

export const googleAnalyticsMetrics = mysqlTable("google_analytics_metrics", {
  id: int("id").autoincrement().primaryKey(),
  metricId: varchar("metric_id", { length: 256 }).notNull(), // metricId is used to get metrics details, metrics, etc.
  value: int("value").notNull(),
  createdAt: date("created_at").notNull(),
  period: int("period").notNull(), // in days: 0 -> lifetime
  sourceId: bigint("source_id", { mode: "number" }).notNull(),
  integrationId: bigint("integration_id", { mode: "number" }).notNull(),
});

export const googleAnalyticsMetricsRelations = relations(
  googleAnalyticsMetrics,
  ({ one }) => ({
    source: one(googleAnalyticsPages, {
      fields: [
        googleAnalyticsMetrics.sourceId,
        googleAnalyticsMetrics.integrationId,
      ],
      references: [googleAnalyticsPages.id, googleAnalyticsPages.integrationId],
    }),
  })
);

export type GoogleAnalyticsMetric = typeof googleAnalyticsMetrics.$inferSelect;
export type NewGoogleAnalyticsMetric =
  typeof googleAnalyticsMetrics.$inferInsert;
