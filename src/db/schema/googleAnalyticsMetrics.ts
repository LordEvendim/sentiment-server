import { relations } from "drizzle-orm";
import {
  bigint,
  date,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

import { googleAnalyticsPages } from "./googleAnalyticsPages";

export const googleAnalyticsMetrics = mysqlTable(
  "google_analytics_metrics",
  {
    metricId: varchar("metric_id", { length: 256 }).notNull(), // metricId is used to get metrics details, metrics, etc.
    createdAt: date("created_at").notNull(),
    value: int("value").notNull(),
    period: int("period").notNull(), // in days: 0 -> lifetime
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    integrationId: bigint("integration_id", { mode: "number" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.metricId, table.createdAt] }),
  })
);

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
