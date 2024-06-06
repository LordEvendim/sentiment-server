import {
  addWeeks,
  eachDayOfInterval,
  format,
  subDays,
  subWeeks,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { metaAdAccountMetricDao } from "#dao/metaAdAccountMetricDao";
import { metaCampaignMetricDao } from "#dao/metaCampaignMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { NewMetaAdAccountMetric } from "#db/schema/metaAdAccountMetrics";
import { logger } from "#modules/logger";

import { metaGateway } from "./metaGateway";
import { AdAccountInsights } from "./types";

interface CampgainData {
  campaign_id: string;
  campaign_name: string;
  impressions: string;
  reach: string;
  clicks: string;
  spend: string;
  cost_per_unique_inline_link_click: string;
  date_start: string;
  date_stop: string;
}

export class MetaAds {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com";

  pullLastDayData = async (userId: number) => {
    logger.debug("Meta: pulling last day data");
    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Meta: integration not connected");
    if (!integration.selectedAdAccount)
      throw new Error("Meta: ad account not selected");

    const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");

    const data = await this.getAdAccountInsights(
      userId,
      integration.selectedAdAccount,
      lastDay,
      lastDay
    );

    await this.pullTopCampaigns(
      userId,
      integration.selectedAdAccount,
      lastDay,
      lastDay
    );

    return data;
  };

  pullLastFourWeeks = async (userId: number) => {
    logger.debug("Meta: pulling last four weeks");
    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Meta: integration not connected");
    if (!integration.selectedAdAccount)
      throw new Error("Meta: ad account not selected");

    const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");
    const since = toZonedTime(subWeeks(lastDay, 4), "America/New_York");

    await this.getAdAccountInsights(
      userId,
      integration.selectedAdAccount,
      since,
      lastDay
    );

    let currentWeekStart = since;
    for (let i = 0; i < 4; i++) {
      await this.pullTopCampaigns(
        userId,
        integration.selectedAdAccount,
        currentWeekStart,
        addWeeks(currentWeekStart, 1)
      );

      currentWeekStart = addWeeks(currentWeekStart, 1);
    }
  };

  getAdAccountInsights = async (
    userId: number,
    accountId: number,
    since: Date,
    until: Date
  ) => {
    logger.debug(
      `Meta: getting ad account insights for ${userId} of ${accountId}`
    );

    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("User is not connected with Meta");
    if (!integration.accessToken) throw new Error("Meta is not connected");

    const metricsNames = ["clicks", "impressions", "spend", "reach", "cpc"];

    const resultData: AdAccountInsights["data"] = [];
    let nextPage = undefined;
    let isInitial = true;

    while (nextPage || isInitial) {
      isInitial = false;

      logger.debug("Meta: subrequest for cursor: " + nextPage);

      const result: {
        data: {
          data: AdAccountInsights["data"];
          paging?: {
            cursors: {
              before: string;
              after: string;
            };
            next?: string;
          };
        };
      } = await metaGateway.callBUC<AdAccountInsights>({
        url: `${this.baseUrl}/${this.apiVersion}/act_${accountId}/insights`,
        config: {
          params: {
            fields: metricsNames.join(","),
            access_token: integration.accessToken,
            since: format(since, "yyyy-MM-dd"),
            until: format(until, "yyyy-MM-dd"),
            time_increment: 1,
            ...(nextPage && { after: nextPage }),
          },
        },
        userId: userId,
        businessId: accountId,
      });

      nextPage = result.data.paging?.cursors.after;
      resultData.push(...result.data.data);
    }

    const metrics: NewMetaAdAccountMetric[] = [];
    const pushedMetrics = new Set<string>();

    for (let i = 0; i < resultData.length; i++) {
      const dataPoint = resultData[i];

      for (let i = 0; i < metricsNames.length; i++) {
        const metricName = metricsNames[i];
        const value = dataPoint[metricName];

        if (!value) continue;

        pushedMetrics.add(
          metricName + format(dataPoint.date_stop, "yyyy-MM-dd")
        );
        metrics.push({
          createdAt: new Date(dataPoint.date_stop),
          integrationId: integration.id,
          metricId: metricName,
          period: 1,
          sourceId: accountId,
          value: value,
        });
      }
    }

    // fill gaps caused by missing metrics with zero value
    const days = eachDayOfInterval({
      start: since,
      end: until,
    });

    for (const day of days) {
      for (const metric of metricsNames) {
        if (pushedMetrics.has(metric + format(day, "yyyy-MM-dd"))) continue;

        metrics.push({
          createdAt: day,
          integrationId: integration.id,
          metricId: metric,
          period: 1,
          sourceId: accountId,
          value: "0",
        });
      }
    }

    logger.debug(`Meta: inserting Ad account insights metrics to DB`);
    if (metrics.length > 0) await metaAdAccountMetricDao.createMany(metrics);

    return metrics;
  };

  pullTopCampaigns = async (
    userId: number,
    accountId: number,
    since: Date,
    until: Date
  ) => {
    logger.debug(
      `Meta: getting top campaign for ${userId} of ${accountId} - ${format(
        since,
        "yyyy-MM-dd"
      )} - ${format(until, "yyyy-MM-dd")}`
    );

    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("User is not connected with Meta");
    if (!integration.accessToken) throw new Error("Meta is not connected");

    // query
    const campaignDatapoints: CampgainData[] = [];
    let nextPage = undefined;
    let isInitial = true;

    while (nextPage || isInitial) {
      isInitial = false;

      logger.debug("Meta: subrequest for cursor: " + nextPage);

      const result: {
        data: {
          data: CampgainData[];
          paging?: {
            cursors: {
              before: string;
              after: string;
            };
            next?: string;
          };
        };
      } = await metaGateway.callBUC({
        url: `${this.baseUrl}/${this.apiVersion}/act_${accountId}/insights`,
        config: {
          params: {
            level: "campaign",
            fields:
              "campaign_id,campaign_name,impressions,reach,clicks,cost_per_unique_inline_link_click,spend",
            effective_status: '["ACTIVE"]',
            access_token: integration.accessToken,
            time_range: {
              since: format(since, "yyyy-MM-dd"),
              until: format(until, "yyyy-MM-dd"),
            },
            time_increment: 1,
            ...(nextPage && { after: nextPage }),
          },
        },
        userId: userId,
        businessId: accountId,
      });

      nextPage = result.data.paging?.cursors.after;
      campaignDatapoints.push(...result.data.data);
    }

    logger.debug("Meta: saving campaign data");

    if (campaignDatapoints.length === 0) return [];

    await metaCampaignMetricDao.createMany(
      campaignDatapoints.map((datapoint) => ({
        campaignId: datapoint.campaign_id,
        createdAt: new Date(datapoint.date_stop),
        integrationId: integration.id,
        name: datapoint.campaign_name,
        period: 1,
        sourceId: accountId,
        clicks: parseInt(datapoint.clicks) || 0,
        cost_per_unique_inline_link_click:
          parseFloat(datapoint.cost_per_unique_inline_link_click) || 0,
        impressions: parseInt(datapoint.impressions) || 0,
        reach: parseInt(datapoint.reach) || 0,
        spend: parseFloat(datapoint.spend) || 0,
      }))
    );

    return campaignDatapoints;
  };

  getTopCampaigns = async (userId: number, since: Date) => {
    logger.debug(`Meta: pulling top campaign for ${userId}`);

    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("User is not connected with Meta");
    if (!integration.selectedAdAccount)
      throw new Error("Meta is not connected");

    const data = await metaCampaignMetricDao.getTopCampaigns(
      integration.selectedAdAccount,
      integration.id,
      since
    );

    return data;
  };
}

export const metaAds = new MetaAds();
