import { and, eq, gte, sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { googleAdsCampaignMetrics } from "#db/schema";
import {
  GoogleAdsAdGroup,
  googleAdsAdGroups,
  NewGoogleAdsAdGroup,
} from "#db/schema/googleAdsAdGroups";

export const googleAdsAdGroupDao = {
  getAdGroupsSummarySince: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase.execute(
      sql`
      select
        ANY_VALUE(${googleAdsAdGroups.adGroupId}) as adGroupId,
        ANY_VALUE(${googleAdsAdGroups.campaignId}) as campaignId,
        ANY_VALUE(${googleAdsAdGroups.name}) as name, 
        ANY_VALUE(${googleAdsAdGroups.status}) as status,
        ANY_VALUE(${googleAdsCampaignMetrics.name}) as campaignName,
        SUM(${googleAdsAdGroups.clicks}) as clicks, 
        SUM(${googleAdsAdGroups.impressions}) as impressions,
        SUM(${googleAdsAdGroups.spend}) as spend
      from ${googleAdsAdGroups}
      INNER JOIN ${googleAdsCampaignMetrics} ON ${googleAdsCampaignMetrics.campaignId} = ${googleAdsAdGroups.campaignId}
      where ${googleAdsAdGroups.sourceId} = ${accountId} and ${googleAdsAdGroups.integrationId} = ${integrationId} and ${googleAdsAdGroups.createdAt} >= ${since}
      group by ${googleAdsAdGroups.adGroupId}
      `
    );

    return (result[0] ?? []) as unknown as Omit<
      GoogleAdsAdGroup,
      "sourceId" | "integrationId" | "createdAt"
    >[];
  },
  getByAccountSince: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase
      .select()
      .from(googleAdsAdGroups)
      .where(
        and(
          eq(googleAdsAdGroups.sourceId, accountId),
          eq(googleAdsAdGroups.integrationId, integrationId),
          gte(googleAdsAdGroups.createdAt, since)
        )
      );

    return result;
  },
  createMany: async (newGoogleAdsAdGroup: NewGoogleAdsAdGroup[]) => {
    const result = await mysqlDatabase
      .insert(googleAdsAdGroups)
      .values(newGoogleAdsAdGroup)
      .onDuplicateKeyUpdate({
        set: {
          campaignId: sql`values(campaign_id)`,
          sourceId: sql`values(source_id)`,
          integrationId: sql`values(integration_id)`,
          createdAt: sql`values(created_at)`,
          status: sql`values(status)`,
          name: sql`values(name)`,
          clicks: sql`values(clicks)`,
          impressions: sql`values(impressions)`,
          spend: sql`values(spend)`,
          ctr: sql`values(ctr)`,
        },
      });

    return result;
  },
};

export type GoogleAdsAdGroupDao = typeof googleAdsAdGroupDao;
