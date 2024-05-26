import { endOfYesterday, subDays } from "date-fns";

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
    report: ReportData
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
          subDays(endOfYesterday(), 7)
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
    report: GenerativeReportData
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
          subDays(endOfYesterday(), 7 * 4)
        )
      ).map((metric) => ({ ...metric, value: parseFloat(metric.value) }));

      report.push(
        ...metrics.map((metric) => ({
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
