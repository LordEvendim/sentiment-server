import { endOfYesterday, subDays } from "date-fns";

import { googleAnalyticsMetricDao } from "#dao/googleAnalyticsMetricDao";
import { googleIntegrationDao } from "#dao/googleIntegrationDao";

import {
  MetricConfig,
  ReportData,
  ReporterDataProvider,
  ReportMetricSource,
} from "../types";
import { appendReportWithData } from "../utils";

class GoogleAnalyticsDataProvider implements ReporterDataProvider {
  source: ReportMetricSource = "google-analytics";

  report = async (
    userId: number,
    metricsConfig: MetricConfig[],
    report: ReportData
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
        subDays(endOfYesterday(), 7 * 4)
      );

      appendReportWithData(report, metrics, metricsConfig, this.source);
    } catch (err) {
      /* empty */
    }
  };
}

export const googleAnalyticsDataProvider = new GoogleAnalyticsDataProvider();
