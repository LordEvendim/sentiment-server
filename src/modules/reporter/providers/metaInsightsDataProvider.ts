import { metaInsightsMetricDao } from "#dao/metaInsightsMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";

import {
  GenerativeReportData,
  MetricConfig,
  ReportData,
  ReporterDataProvider,
  ReportMetricSource,
} from "../types";
import { appendReportWithData } from "../utils";

class MetaInsightsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "meta-insights";

  report = async (
    userId: number,
    metricsConfig: MetricConfig[],
    report: ReportData,
    since: Date
  ) => {
    try {
      const integration =
        await metaIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Meta is not integrated");
      if (!integration.selectedPage) throw new Error("Meta page not selected");

      const metrics = await metaInsightsMetricDao.getByPageSince(
        integration.selectedPage,
        integration.id,
        since
      );

      appendReportWithData(report, metrics, metricsConfig, this.source);
    } catch (err) {
      /* empty */
    }
  };
  generativeReport = async (
    userId: number,
    metricsConfig: MetricConfig[],
    report: GenerativeReportData,
    since: Date
  ) => {
    try {
      const integration =
        await metaIntegrationDao.getIntegrationByUserId(userId);

      const metricsNames = metricsConfig.map((config) => config.id);

      if (!integration) throw new Error("Meta is not integrated");
      if (!integration.selectedPage) throw new Error("Meta page not selected");

      const metrics = await metaInsightsMetricDao.getByPageSince(
        integration.selectedPage,
        integration.id,
        since
      );

      report.push(
        ...metrics
          .filter((config) => metricsNames.includes(config.metricId))
          .map((metric) => ({
            metricId: metric.metricId,
            source: this.source,
            value: metric.value,
            createdAt: metric.createdAt,
          }))
      );
    } catch (err) {
      /* empty */
    }
  };
}

export const metaInsightsDataProvider = new MetaInsightsDataProvider();
