import { googleAnalyticsMetricDao } from "#dao/googleAnalyticsMetricDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";

import { ReporterDataProvider, ReportMetricSource } from "../types";

class GoogleAdsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "google-ads";

  metric = async (userId: number, metricId: string, since: Date) => {
    try {
      const integration =
        await googleIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Google is not integrated");
      if (!integration.selectedAdAccount)
        throw new Error("Google ads account not selected");

      const metrics = await googleAnalyticsMetricDao.getByAccountAndMetricId(
        integration.selectedAdAccount,
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

  report = async (userId: number) => {
    try {
      const integration =
        await googleIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Google is not integrated");
      if (!integration.selectedAdAccount)
        throw new Error("Google ads account not selected");

      // const metrics = await googleAnalyticsMetricDao.getByAccountSince(
      //   integration.selectedAdAccount,
      //   integration.id,
      //   subDays(endOfYesterday(), 7)
      // );

      // appendReportWithData(report, metrics, metricsConfig, this.source);
    } catch (err) {
      /* empty */
    }
  };
  generativeReport = async (userId: number) => {
    try {
      const integration =
        await googleIntegrationDao.getIntegrationByUserId(userId);

      if (!integration) throw new Error("Google is not integrated");
      if (!integration.selectedAdAccount)
        throw new Error("Google ads account not selected");

      // const metrics = await googleAnalyticsMetricDao.getByAccountSince(
      //   integration.selectedAdAccount,
      //   integration.id,
      //   subDays(endOfYesterday(), 7 * 4)
      // );

      // appendReportWithData(report, metrics, metricsConfig, this.source);
    } catch (err) {
      /* empty */
    }
  };
}

export const googleAdsDataProvider = new GoogleAdsDataProvider();
