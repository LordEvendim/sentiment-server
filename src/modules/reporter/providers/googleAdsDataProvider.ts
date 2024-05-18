import { googleIntegrationDao } from "#dao/googleIntegrationDao";

import { ReporterDataProvider, ReportMetricSource } from "../types";

class GoogleAdsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "google-ads";

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
      //   subDays(endOfYesterday(), 7 * 4)
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
