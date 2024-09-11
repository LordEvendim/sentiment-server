import { format } from "date-fns";

import { metaAdAccountMetricDao } from "#dao/metaAdAccountMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";

import {
  GenerativeReportData,
  MetricConfig,
  ReportData,
  ReporterDataProvider,
  ReportMetricSource,
} from "../types";
import { appendReportWithData } from "../utils";

class MetaAdsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "meta-ads";

  metric = async (userId: number, metricId: string, since: Date) => {
    try {
      const integration =
        await metaIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Meta Ads: not integrated");
      if (!integration.selectedAdAccount)
        throw new Error("Meta Ads: account not selected");

      const metrics =
        await metaAdAccountMetricDao.getByPageAndMetricIdOrderByCreatedAt(
          integration.selectedAdAccount,
          integration.id,
          metricId,
          since
        );

      return metrics.map(
        (metric) =>
          [parseFloat(metric.value), format(metric.createdAt, "yyyyMMdd")] as [
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
      const metaIntegration =
        await metaIntegrationDao.getIntegrationByUserId(userId);

      if (!metaIntegration) throw new Error("Meta Ads: not integrated");
      if (!metaIntegration.selectedAdAccount)
        throw new Error("Meta Ads: account not selected");

      const metrics = (
        await metaAdAccountMetricDao.getByPageSince(
          metaIntegration.selectedAdAccount,
          metaIntegration.id,
          since
        )
      ).map((metric) => ({ ...metric, value: parseFloat(metric.value) }));

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
      const metaIntegration =
        await metaIntegrationDao.getIntegrationByUserId(userId);

      const metricsNames = metricsConfig.map((config) => config.id);

      if (!metaIntegration) throw new Error("Meta Ads: not integrated");
      if (!metaIntegration.selectedAdAccount)
        throw new Error("Meta Ads: account not selected");

      const metrics = (
        await metaAdAccountMetricDao.getByPageSince(
          metaIntegration.selectedAdAccount,
          metaIntegration.id,
          since
        )
      ).map((metric) => ({ ...metric, value: parseFloat(metric.value) }));

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

export const metaAdsDataProvider = new MetaAdsDataProvider();
