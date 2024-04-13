import { endOfYesterday, subDays } from "date-fns";

import { metaInsightsMetricDao } from "#dao/metaInsightsMetricDao";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";

import {
  GeneralDashboardReportData,
  MetricConfig,
  ReporterDataProvider,
  ReportMetricSource,
} from "../types";
import { appendReportWithData } from "../utils";

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

      const metrics = await metaInsightsMetricDao.getByPageSince(
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

export const metaInsightsDataProvider = new MetaInsightsDataProvider();
