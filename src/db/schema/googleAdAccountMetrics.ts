import { relations } from "drizzle-orm";
import {
  bigint,
  date,
  double,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

import { googleAdAccounts } from "./googleAdAccounts";

export const googleAdAccountMetrics = mysqlTable(
  "google_ad_account_metrics",
  {
    metricId: varchar("metric_id", { length: 256 }).notNull(),
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    createdAt: date("created_at").notNull(),
    value: double("value", { scale: 4 }).notNull(),
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

export const googleAdAccountMetricsRelations = relations(
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

export type GoogleAdAccountMetric = typeof googleAdAccountMetrics.$inferSelect;
export type NewGoogleAdAccountMetric =
  typeof googleAdAccountMetrics.$inferInsert;
