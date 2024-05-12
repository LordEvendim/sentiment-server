import { eachDayOfInterval, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { metaAdAccountMetricDao } from "#dao/metaAdAccountMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { NewMetaAdAccountMetric } from "#db/schema/metaAdAccountMetrics";
import { logger } from "#modules/logger";

import { metaGateway } from "./metaGateway";
import { AdAccountInsights } from "./types";

export class MetaAds {
  apiVersion = "v18.0";
  baseUrl = "https://graph.facebook.com";

  pullLastDayData = async (userId: number) => {
    logger.debug("Meta: pulling last day data");
    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration) throw new Error("Meta: integration not connected");
    if (!integration.selectedAdAccount)
      throw new Error("Meta: ad account not selected");

    const lastDay = toZonedTime(Date.now(), "America/New_York");

    const data = await this.getAdAccountInsights(
      userId,
      integration.selectedAdAccount,
      lastDay,
      lastDay
    );

    return data;
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

    const result = await metaGateway.callBUC<AdAccountInsights>({
      url: `${this.baseUrl}/${this.apiVersion}/act_${accountId}/insights`,
      config: {
        params: {
          fields: metricsNames.join(","),
          access_token: integration.accessToken,
          since: format(since, "yyyy-MM-dd"),
          until: format(until, "yyyy-MM-dd"),
          time_increment: 1,
        },
      },
      userId: userId,
      businessId: accountId,
    });

    const metrics: NewMetaAdAccountMetric[] = [];
    const pushedMetrics = new Set<string>();

    for (let i = 0; i < result.data.data.length; i++) {
      const dataPoint = result.data.data[i];

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
}

export const metaAds = new MetaAds();
