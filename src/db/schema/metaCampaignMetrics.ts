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
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    createdAt: date("created_at").notNull(),
    integrationId: bigint("integration_id", { mode: "number" }).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    period: int("period").notNull(), // in days: 0 -> lifetime
    clicks: int("clicks"),
    reach: int("reach"),
    impressions: int("impressions"),
    cost_per_unique_inline_link_click: double(
      "cost_per_unique_inline_link_click",
      { scale: 4 }
    ),
    spend: double("spend", { scale: 4 }),
    inline_link_clicks: int("inline_link_clicks"),
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_meta_campaign_metrics",
      columns: [
        table.campaignId,
        table.createdAt,
        table.sourceId,
        table.integrationId,
      ],
    }),
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
