import { relations } from "drizzle-orm";
import {
  bigint,
  date,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

import { googleAdAccounts } from "./googleAdAccounts";

export const googleAdAccountMetrics = mysqlTable(
  "google_ad_account_metrics",
  {
    metricId: varchar("metric_id", { length: 256 }).notNull(), // metricId is used to get metrics details, metrics, etc.
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    createdAt: date("created_at").notNull(),
    value: int("value").notNull(),
    period: int("period").notNull(), // in days: 0 -> lifetime
    integrationId: bigint("integration_id", { mode: "number" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_google_ad_account_metrics",
      columns: [
        table.metricId,
        table.createdAt,
        table.sourceId,
        table.integrationId,
      ],
    }),
  })
);

export const googleAnalyticsMetricsRelations = relations(
  googleAdAccountMetrics,
  ({ one }) => ({
    source: one(googleAdAccounts, {
      fields: [
        googleAdAccountMetrics.sourceId,
        googleAdAccountMetrics.integrationId,
      ],
      references: [googleAdAccounts.id, googleAdAccounts.integrationId],
    }),
  })
);

export type GoogleAnalyticsMetric = typeof googleAdAccountMetrics.$inferSelect;
export type NewGoogleAnalyticsMetric =
  typeof googleAdAccountMetrics.$inferInsert;
