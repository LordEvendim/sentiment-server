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

  report = async (
    userId: number,
    metricsConfig: MetricConfig[],
    report: ReportData,
    since: Date
  ) => {
    try {
      const metaIntegration =
        await metaIntegrationDao.getIntegrationByUserId(userId);

      if (!metaIntegration) throw new Error("Meta is not integrated");
      if (!metaIntegration.selectedAdAccount)
        throw new Error("Meta ad account not selected");

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

      if (!metaIntegration) throw new Error("Meta is not integrated");
      if (!metaIntegration.selectedAdAccount)
        throw new Error("Meta ad account not selected");

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
