import axios from "axios";
import { format } from "date-fns";

import { metaAdAccountMetricDao } from "#dao/metaAdAccountMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { NewMetaAdAccountMetric } from "#db/schema/metaAdAccountMetrics";
import { logger } from "#modules/logger";

import { AdAccountInsights } from "./types";

export class MetaAds {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com";

  getAccountOverview = async () => {};

  getAdAccountInsights = async (
    userId: number,
    accountId: number,
    since: Date,
    until: Date
  ) => {
    logger.debug(
      `Meta: getting ad account insights for ${userId} of ${accountId}`
    );

    const integration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    if (!integration) throw new Error("User is not connected with Meta");
    if (!integration.accessToken) throw new Error("Meta is not connected");

    const metricsNames = ["clicks", "impressions", "spend", "reach", "cpc"];

    const result = await axios.get<AdAccountInsights>(
      `${this.baseUrl}/${this.apiVersion}/act_${accountId}/insights`,
      {
        params: {
          metric: metricsNames.join(","),
          access_token: integration.accessToken,
          since: format(since, "yyyy-MM-dd"),
          until: format(until, "yyyy-MM-dd"),
          time_increment: "day",
        },
      }
    );

    const metrics: NewMetaAdAccountMetric[] = [];

    for (let i = 0; i < result.data.data.length; i++) {
      const dataPoint = result.data.data[i];

      for (let i = 0; i < metricsNames.length; i++) {
        const metricName = metricsNames[i];
        const value = dataPoint[metricName];

        if (!value) continue;

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

    logger.debug(`Meta: inserting Ad account insights metrics to DB`);
    await metaAdAccountMetricDao.createMany(metrics);

    return metrics;
  };
}

export const metaAds = new MetaAds();
