import { googleAnalyticsMetricDao } from "#dao/googleAnalyticsMetricDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";

import {
  GenerativeReportData,
  MetricConfig,
  ReportData,
  ReporterDataProvider,
  ReportMetricSource,
} from "../types";
import { appendReportWithData } from "../utils";

class GoogleAnalyticsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "google-analytics";

  metric = async (userId: number, metricId: string, since: Date) => {
    try {
      const integration =
        await googleIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Google is not integrated");
      if (!integration.selectedPage)
        throw new Error("Google analytics account not selected");

      const metrics =
        await googleAnalyticsMetricDao.getByAccountAndMetricIdOrderByCreatedAt(
          integration.selectedPage,
          integration.id,
          metricId,
          since
        );

      return metrics.map(
        (metric) =>
          [metric.value, metric.createdAt.getTime()] as [number, number]
      );
    } catch (err) {
      return [];
    }
  };

  report = async (
    userId: number,
    metricsConfig: MetricConfig[],
    report: ReportData,
    since: Date
  ) => {
    try {
      const integration =
        await googleIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Google is not integrated");
      if (!integration.selectedPage)
        throw new Error("Google analytics account not selected");

      const metrics = await googleAnalyticsMetricDao.getByAccountSince(
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
        await googleIntegrationDao.getIntegrationByUserId(userId);

      const metricsNames = metricsConfig.map((config) => config.id);

      if (!integration) throw new Error("Google is not integrated");
      if (!integration.selectedPage)
        throw new Error("Google analytics account not selected");

      const metrics = await googleAnalyticsMetricDao.getByAccountSince(
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

export const googleAnalyticsDataProvider = new GoogleAnalyticsDataProvider();
