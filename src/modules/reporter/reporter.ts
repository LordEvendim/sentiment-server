import { endOfYesterday, subDays } from "date-fns";

import { metaAdAccountMetricDao } from "#dao/metaAdAccountMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";

class Reporter {
  getGeneralDashboardData = async (userId: number) => {
    const metaIntegration =
      await metaIntegrationDao.getMetaIntegrationByUserId(userId);

    const report: {
      [metric: string]: {
        [source: string]: {
          value: number;
          date: Date;
        }[];
      };
    } = {};

    try {
      if (!metaIntegration) throw new Error("Meta is not integrated");
      if (!metaIntegration.selectedAdAccount)
        throw new Error("Meta ad account not selected");

      const trackedMetaMetrics = new Set(["spend", "reach", "impressions"]);
      const metaMetricToInternalMetric = {
        spend: "spend",
        reach: "reach",
        impressions: "impressions",
      } as {
        [key: string]: string;
      };

      const metrics = await metaAdAccountMetricDao.getByPageSince(
        metaIntegration.selectedAdAccount,
        metaIntegration.id,
        subDays(endOfYesterday(), 7 * 4)
      );

      for (let i = 0; i < metrics.length; i++) {
        if (trackedMetaMetrics.has(metrics[i].metricId)) {
          const internalMetric =
            metaMetricToInternalMetric[metrics[i].metricId];

          if (!report[internalMetric]) report[internalMetric] = { metaAds: [] };

          report[internalMetric].metaAds.push({
            date: metrics[i].createdAt,
            value: parseFloat(metrics[i].value),
          });
        }
      }
    } catch (err) {
      /* empty */
    }

    return report;
  };
}

export const reporter = new Reporter();
