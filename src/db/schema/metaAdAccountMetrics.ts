import { relations } from "drizzle-orm";
import { bigint, date, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { metaAdAccounts } from "./metaAdAccounts";

export const metaAdAccountMetrics = mysqlTable("meta_ad_account_metrics", {
  id: int("id").autoincrement().primaryKey(),
  metricId: varchar("metric_id", { length: 256 }).notNull(), // metricId is used to get metrics details, metrics, etc.
  value: varchar("value", { length: 15 }).notNull(),
  createdAt: date("created_at").notNull(),
  period: int("period").notNull(), // in days: 0 -> lifetime
  sourceId: bigint("source_id", { mode: "number" }).notNull(),
  integrationId: int("integration_id").notNull(),
});

export const metaAdAccountMetricsRelations = relations(
  metaAdAccountMetrics,
  ({ one }) => ({
    source: one(metaAdAccounts, {
      fields: [
        metaAdAccountMetrics.sourceId,
        metaAdAccountMetrics.integrationId,
      ],
      references: [metaAdAccounts.id, metaAdAccounts.integrationId],
    }),
  })
);

export type MetaAdAccountMetric = typeof metaAdAccountMetrics.$inferSelect;
export type NewMetaAdAccountMetric = typeof metaAdAccountMetrics.$inferInsert;
