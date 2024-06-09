import { logger } from "#modules/logger";

import { generalDashboardMetricsConfig } from "./metrics";
import { googleAdsDataProvider } from "./providers/googleAdsDataProvider";
import { googleAnalyticsDataProvider } from "./providers/googleAnalyticsDataProvider";
import { metaAdsDataProvider } from "./providers/metaAdsDataProvider";
import { metaInsightsDataProvider } from "./providers/metaInsightsDataProvider";
import {
  GenerativeReportData,
  ReportData,
  ReporterDataProvider,
  ReportMetricSource,
} from "./types";

const reportDataProviders: Record<
  ReportMetricSource,
  ReporterDataProvider | undefined
> = {
  "google-ads": googleAdsDataProvider,
  "google-analytics": googleAnalyticsDataProvider,
  "meta-ads": metaAdsDataProvider,
  "meta-insights": metaInsightsDataProvider,
};

class Reporter {
  getGeneralDashboardData = async (userId: number, since: number) => {
    const report: ReportData = [];
    // create an object with used data providers
    const usedDataProvdiers = new Set<ReportMetricSource>();
    for (let i = 0; i < generalDashboardMetricsConfig.length; i++) {
      const source = generalDashboardMetricsConfig[i].source;

      usedDataProvdiers.add(source);
    }

    // get metrics only form used data providers
    for (const dataProvierName of usedDataProvdiers.values()) {
      logger.debug(`Reporter: getting data from: ${dataProvierName}`);

      await reportDataProviders[dataProvierName]?.report(
        userId,
        generalDashboardMetricsConfig.filter(
          (config) => config.source === dataProvierName
        ),
        report,
        new Date(since)
      );
    }

    return report;
  };
  getLast4WeeksOverviewReportData = async (userId: number) => {
    const report: GenerativeReportData = [];
    // create an object with used data providers
    const usedDataProvdiers = new Set<ReportMetricSource>();
    for (let i = 0; i < generalDashboardMetricsConfig.length; i++) {
      const source = generalDashboardMetricsConfig[i].source;

      usedDataProvdiers.add(source);
    }

    // get metrics only form used data providers
    for (const dataProvierName of usedDataProvdiers.values()) {
      logger.debug(`Reporter: getting data from: ${dataProvierName}`);

      await reportDataProviders[dataProvierName]?.generativeReport(
        userId,
        generalDashboardMetricsConfig.filter(
          (config) => config.source === dataProvierName
        ),
        report
      );
    }

    return report;
  };
}

export const reporter = new Reporter();
