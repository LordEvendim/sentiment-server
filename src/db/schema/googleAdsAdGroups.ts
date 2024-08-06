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

export const googleAdsAdGroups = mysqlTable(
  "google_ads_ad_groups",
  {
    adGroupId: varchar("ad_group_id", { length: 256 }).notNull(),
    campaignId: varchar("campaign_id", { length: 256 }).notNull(),
    sourceId: bigint("source_id", { mode: "number" }).notNull(),
    integrationId: bigint("integration_id", { mode: "number" }).notNull(),
    createdAt: date("created_at").notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    clicks: int("clicks"),
    impressions: int("impressions"),
    spend: double("spend", { scale: 4 }),
    ctr: double("ctr", { scale: 4 }),
    status: varchar("status", { length: 12 }),
  },
  (table) => ({
    pk: primaryKey({
      name: "pk_google_ads_ad_groups",
      columns: [
        table.adGroupId,
        table.createdAt,
        table.sourceId,
        table.integrationId,
      ],
    }),
  })
);

export const googleAdsAdGroupsRelations = relations(
  googleAdsAdGroups,
  ({ one }) => ({
    source: one(googleAdAccounts, {
      fields: [googleAdsAdGroups.sourceId, googleAdsAdGroups.integrationId],
      references: [googleAdAccounts.id, googleAdAccounts.integrationId],
    }),
  })
);

export type GoogleAdsAdGroup = typeof googleAdsAdGroups.$inferSelect;
export type NewGoogleAdsAdGroup = typeof googleAdsAdGroups.$inferInsert;
