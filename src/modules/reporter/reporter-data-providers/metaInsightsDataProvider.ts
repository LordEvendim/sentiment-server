import { endOfYesterday, subDays } from "date-fns";

import { metaInsightsMetricDao } from "#dao/metaInsightsMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";

import {
  GeneralDashboardReportData,
  MetricConfig,
  ReporterDataProvider,
  ReportMetricSource,
} from "../types";
import { formatTrackedMetricsConfigs } from "../utils";

class MetaInsightsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "meta-insights";

  report = async (
    userId: number,
    metricsConfig: MetricConfig[],
    report: GeneralDashboardReportData
  ) => {
    try {
      const integration =
        await metaIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Meta is not integrated");
      if (!integration.selectedPage) throw new Error("Meta page not selected");

      const [metricsConfigSet, metricsConfigMap] = formatTrackedMetricsConfigs(
        metricsConfig,
        this.source
      );

      const metrics = await metaInsightsMetricDao.getByPageSince(
        integration.selectedPage,
        integration.id,
        subDays(endOfYesterday(), 7 * 4)
      );

      for (let i = 0; i < metrics.length; i++) {
        const metricId = metrics[i]
          .metricId as keyof GeneralDashboardReportData;
        const metricConfig = metricsConfigMap[metricId];

        if (!metricsConfigSet.has(metricId)) continue;
        if (!metricConfig) throw new Error("Metric config was not found");

        const datapoint = {
          value: metrics[i].value,
          createdAt: metrics[i].createdAt,
        };

        if (!report[metricId]) {
          report[metricId] = {};
        }

        report[metricId][this.source] = datapoint;
      }
    } catch (err) {
      /* empty */
    }
  };
}

export const metaInsightsDataProvider = new MetaInsightsDataProvider();
