import { and, eq, gte, sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import {} from "#db/schema";
import {
  metaCampaignMetrics,
  NewMetaCampaignMetric,
} from "#db/schema/metaCampaignMetrics";
import { TopMetaCampaign } from "#modules/meta/types";

export const metaCampaignMetricDao = {
  getTopCampaigns: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase.execute(
      sql`
      select ${metaCampaignMetrics.campaignId}, 
        ANY_VALUE(${metaCampaignMetrics.campaignId}) as id, 
        ANY_VALUE(${metaCampaignMetrics.name}) as name, 
        SUM(${metaCampaignMetrics.clicks}) as clicks, 
        AVG(${metaCampaignMetrics.cost_per_unique_inline_link_click}) as cost_per_unique_inline_link_click, 
        SUM(${metaCampaignMetrics.impressions}) as impressions,
        SUM(${metaCampaignMetrics.spend}) as spend,
        SUM(${metaCampaignMetrics.reach}) as reach
      from ${metaCampaignMetrics}
      where ${metaCampaignMetrics.sourceId} = ${accountId} and ${metaCampaignMetrics.integrationId} = ${integrationId} and ${metaCampaignMetrics.createdAt} > ${since}
      group by ${metaCampaignMetrics.campaignId}
      order by SUM(${metaCampaignMetrics.clicks}) desc
      `
    );

    return (result[0] ?? []) as unknown as TopMetaCampaign[];
  },
  getByAccountSince: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase.query.metaCampaignMetrics.findMany({
      where: and(
        eq(metaCampaignMetrics.sourceId, accountId),
        eq(metaCampaignMetrics.integrationId, integrationId),
        gte(metaCampaignMetrics.createdAt, since)
      ),
    });

    return result;
  },
  createMany: async (newMetaCampaignMetrics: NewMetaCampaignMetric[]) => {
    const result = await mysqlDatabase
      .insert(metaCampaignMetrics)
      .values(newMetaCampaignMetrics)
      .onDuplicateKeyUpdate({
        set: {
          campaignId: sql`values(campaign_id)`,
          name: sql`values(name)`,
          createdAt: sql`values(created_at)`,
          clicks: sql`values(clicks)`,
          cost_per_unique_inline_link_click: sql`values(cost_per_unique_inline_link_click)`,
          impressions: sql`values(impressions)`,
          reach: sql`values(reach)`,
          spend: sql`values(spend)`,
        },
      });

    return result;
  },
};

export type MetaCampaignMetricDao = typeof metaCampaignMetricDao;
