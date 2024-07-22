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

export const googleAdsCampaignMetrics = mysqlTable(
  "google_ads_campaign_metrics",
  {
    campaignId: varchar("campaign_id", { length: 256 }).notNull(),
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    integrationId: bigint("integration_id", { mode: "number" }).notNull(),
    createdAt: date("created_at").notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    biddingStrategyType: varchar("bidding_strategy_type", {
      length: 30,
    }).notNull(),
    budget: double("budget", { scale: 4 }),
    period: int("period").notNull(),
    clicks: int("clicks"),
    impressions: int("impressions"),
    spend: double("spend", { scale: 4 }),
    uniqueUsers: int("unique_users"),
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_google_ads_campaign_metrics",
      columns: [
        table.campaignId,
        table.createdAt,
        table.sourceId,
        table.integrationId,
      ],
    }),
  })
);

export const googleAdsCampaignMetricsRelations = relations(
  googleAdsCampaignMetrics,
  ({ one }) => ({
    source: one(googleAdAccounts, {
      fields: [
        googleAdsCampaignMetrics.sourceId,
        googleAdsCampaignMetrics.integrationId,
      ],
      references: [googleAdAccounts.id, googleAdAccounts.integrationId],
    }),
  })
);

export type GoogleAdsCampaignMetric =
  typeof googleAdsCampaignMetrics.$inferSelect;
export type NewGoogleAdsCampaignMetric =
  typeof googleAdsCampaignMetrics.$inferInsert;
