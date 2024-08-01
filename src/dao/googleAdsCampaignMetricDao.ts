import { and, eq, gte, sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import {
  GoogleAdsCampaignMetric,
  googleAdsCampaignMetrics,
  NewGoogleAdsCampaignMetric,
} from "#db/schema/googleAdsCampaignMetrics";

export const googleAdsCampaignMetricDao = {
  getTopCampaigns: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase.execute(
      sql`
      select
        ANY_VALUE(${googleAdsCampaignMetrics.campaignId}) as id, 
        ANY_VALUE(${googleAdsCampaignMetrics.name}) as name, 
        ANY_VALUE(${googleAdsCampaignMetrics.status}) as status,
        SUM(${googleAdsCampaignMetrics.clicks}) as clicks, 
        SUM(${googleAdsCampaignMetrics.impressions}) as impressions,
        SUM(${googleAdsCampaignMetrics.spend}) as spend,
        SUM(${googleAdsCampaignMetrics.uniqueUsers}) as unique_users,
        SUM(${googleAdsCampaignMetrics.targetCpa}) as target_cpa
      from ${googleAdsCampaignMetrics}
      where ${googleAdsCampaignMetrics.sourceId} = ${accountId} and ${googleAdsCampaignMetrics.integrationId} = ${integrationId} and ${googleAdsCampaignMetrics.createdAt} >= ${since}
      group by ${googleAdsCampaignMetrics.campaignId}
      `
    );

    return (result[0] ?? []) as unknown as GoogleAdsCampaignMetric[];
  },
  getByAccountSince: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase
      .select()
      .from(googleAdsCampaignMetrics)
      .where(
        and(
          eq(googleAdsCampaignMetrics.sourceId, accountId),
          eq(googleAdsCampaignMetrics.integrationId, integrationId),
          gte(googleAdsCampaignMetrics.createdAt, since)
        )
      );

    return result;
  },
  createMany: async (
    newGoogleCampaignMetrics: NewGoogleAdsCampaignMetric[]
  ) => {
    const result = await mysqlDatabase
      .insert(googleAdsCampaignMetrics)
      .values(newGoogleCampaignMetrics)
      .onDuplicateKeyUpdate({
        set: {
          campaignId: sql`values(campaign_id)`,
          sourceId: sql`values(source_id)`,
          integrationId: sql`values(integration_id)`,
          createdAt: sql`values(created_at)`,
          name: sql`values(name)`,
          biddingStrategyType: sql`values(bidding_strategy_type)`,
          budget: sql`values(budget)`,
          period: sql`values(period)`,
          clicks: sql`values(clicks)`,
          impressions: sql`values(impressions)`,
          spend: sql`values(spend)`,
          uniqueUsers: sql`values(unique_users)`,
        },
      });

    return result;
  },
};

export type GoogleAdsCampaignMetricDao = typeof googleAdsCampaignMetricDao;
