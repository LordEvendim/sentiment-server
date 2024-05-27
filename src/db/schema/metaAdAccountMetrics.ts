import { relations } from "drizzle-orm";
import {
  bigint,
  date,
  int,
  mysqlTable,
  primaryKey,
  varchar,
} from "drizzle-orm/mysql-core";

import { metaAdAccounts } from "./metaAdAccounts";

export const metaAdAccountMetrics = mysqlTable(
  "meta_ad_account_metrics",
  {
    metricId: varchar("metric_id", { length: 256 }).notNull(), // metricId is used to get metrics details, metrics, etc.
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    createdAt: date("created_at").notNull(),
    value: varchar("value", { length: 15 }).notNull(),
    period: int("period").notNull(), // in days: 0 -> lifetime
    integrationId: int("integration_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_meta_ad_account_metrics",
      columns: [
        table.metricId,
        table.createdAt,
        table.sourceId,
        table.integrationId,
      ],
    }),
  })
);

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
