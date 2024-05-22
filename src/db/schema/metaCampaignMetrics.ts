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

import { metaAdAccounts } from "./metaAdAccounts";

export const metaCampaignMetrics = mysqlTable(
  "meta_campaign_metrics",
  {
    campaignId: varchar("campaign_id", { length: 256 }).notNull(),
    integrationId: bigint("integration_id", { mode: "number" }).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: date("created_at").notNull(),
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    period: int("period").notNull(), // in days: 0 -> lifetime
    clicks: int("clicks"),
    reach: int("reach"),
    impressions: int("impressions"),
    cost_per_unique_inline_link_click: double(
      "cost_per_unique_inline_link_click",
      { scale: 4 }
    ),
    spend: double("spend", { scale: 4 }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.campaignId, table.createdAt] }),
  })
);

export const metaCampaignMetricsRelations = relations(
  metaCampaignMetrics,
  ({ one }) => ({
    source: one(metaAdAccounts, {
      fields: [metaCampaignMetrics.sourceId, metaCampaignMetrics.integrationId],
      references: [metaAdAccounts.id, metaAdAccounts.integrationId],
    }),
  })
);

export type MetaCampaignMetric = typeof metaCampaignMetrics.$inferSelect;
export type NewMetaCampaignMetric = typeof metaCampaignMetrics.$inferInsert;
