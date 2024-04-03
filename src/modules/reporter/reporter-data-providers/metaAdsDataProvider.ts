import { endOfYesterday, subDays } from "date-fns";

import { metaAdAccountMetricDao } from "#dao/metaAdAccountMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";

import { generalReportMetricsConfig } from "../metrics";
import { GeneralDashboardReportData, ReportMetricSource } from "../types";
import { ReporterDataProvider } from "./types";
import { getTrackedMetricsConfigs } from "./utils";

class MetaAdsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "meta-ads";

  generalReport = async (
    userId: number,
    report: GeneralDashboardReportData
  ) => {
    try {
      const metaIntegration =
        await metaIntegrationDao.getMetaIntegrationByUserId(userId);

      if (!metaIntegration) throw new Error("Meta is not integrated");
      if (!metaIntegration.selectedAdAccount)
        throw new Error("Meta ad account not selected");

      const [metricsConfigSet, metricsConfigMap] = getTrackedMetricsConfigs(
        generalReportMetricsConfig,
        this.source
      );

      const metrics = await metaAdAccountMetricDao.getByPageSince(
        metaIntegration.selectedAdAccount,
        metaIntegration.id,
        subDays(endOfYesterday(), 7 * 4)
      );

      for (let i = 0; i < metrics.length; i++) {
        const metricId = metrics[i]
          .metricId as keyof GeneralDashboardReportData;
        const metricConfig = metricsConfigMap[metricId];

        if (!metricsConfigSet.has(metricId)) continue;
        if (!metricConfig) throw new Error("Metric config was not found");

        const datapoint = {
          value: parseFloat(metrics[i].value),
          createdAt: metrics[i].createdAt,
        };

        if (!report[metricId]) {
          report[metricId] = {};
        }

        report[metricId]["meta-ads"] = datapoint;
      }
    } catch (err) {
      /* empty */
    }
  };
}

export const metaAdsDataProvider = new MetaAdsDataProvider();
