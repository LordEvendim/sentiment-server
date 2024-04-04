import { endOfYesterday, subDays } from "date-fns";

import { googleAnalyticsMetricDao } from "#dao/googleAnalyticsMetricDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";

import {
  GeneralDashboardReportData,
  MetricConfig,
  ReporterDataProvider,
  ReportMetricSource,
} from "../types";
import { formatTrackedMetricsConfigs } from "../utils";

class GoogleAdsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "google-ads";

  report = async (
    userId: number,
    metricsConfig: MetricConfig[],
    report: GeneralDashboardReportData
  ) => {
    try {
      const integration =
        await googleIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Google is not integrated");
      if (!integration.selectedAdAccount)
        throw new Error("Google ads account not selected");

      const [metricsConfigSet, metricsConfigMap] = formatTrackedMetricsConfigs(
        metricsConfig,
        this.source
      );

      // const metrics = await googleAnalyticsMetricDao.getByAccountSince(
      //   integration.selectedAdAccount,
      //   integration.id,
      //   subDays(endOfYesterday(), 7 * 4)
      // );

      // for (let i = 0; i < metrics.length; i++) {
      //   const metricId = metrics[i]
      //     .metricId as keyof GeneralDashboardReportData;
      //   const metricConfig = metricsConfigMap[metricId];

      //   if (!metricsConfigSet.has(metricId)) continue;
      //   if (!metricConfig) throw new Error("Metric config was not found");

      //   const datapoint = {
      //     value: metrics[i].value,
      //     createdAt: metrics[i].createdAt,
      //   };

      //   if (!report[metricId]) {
      //     report[metricId] = {};
      //   }

      //   report[metricId][this.source] = datapoint;
      // }
    } catch (err) {
      /* empty */
    }
  };
}

export const googleAdsDataProvider = new GoogleAdsDataProvider();
