import { format } from "date-fns";

import { googleAdAccountMetricDao } from "#dao/googleAdAccountMetricDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";

import {
  GenerativeReportData,
  MetricConfig,
  ReportData,
  ReporterDataProvider,
  ReportMetricSource,
} from "../types";
import { appendReportWithData } from "../utils";

class GoogleAdsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "google-ads";

  metric = async (userId: number, metricId: string, since: Date) => {
    try {
      const integration =
        await googleIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Google Provider: not integrated");
      if (!integration.selectedAdAccount)
        throw new Error("Google Provider: Google ad account not selected");

      const metrics =
        await googleAdAccountMetricDao.getByPageAndMetricIdOrderByCreatedAt(
          integration.selectedAdAccount,
          integration.id,
          metricId,
          since
        );

      return metrics.map(
        (metric) =>
          [metric.value, format(metric.createdAt, "yyyyMMdd")] as [
            number,
            string,
          ]
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

      if (!integration) throw new Error("Google Provider: not integrated");
      if (!integration.selectedAdAccount)
        throw new Error("Google Provider: Google ad account not selected");

      const metrics = await googleAdAccountMetricDao.getByPageSince(
        integration.selectedAdAccount,
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

      if (!integration) throw new Error("Google Provider: not integrated");
      if (!integration.selectedAdAccount)
        throw new Error("Google Provider: Google ad account not selected");

      const metrics = await googleAdAccountMetricDao.getByPageSince(
        integration.selectedAdAccount,
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

export const googleAdsDataProvider = new GoogleAdsDataProvider();
