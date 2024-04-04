import { logger } from "#modules/logger";

import { generalReportMetricsConfig } from "./metrics";
import { googleAdsDataProvider } from "./reporter-data-providers/googleAdsDataProvider";
import { googleAnalyticsDataProvider } from "./reporter-data-providers/googleAnalyticsDataProvider";
import { metaAdsDataProvider } from "./reporter-data-providers/metaAdsDataProvider";
import { metaInsightsDataProvider } from "./reporter-data-providers/metaInsightsDataProvider";
import {
  GeneralDashboardReportData,
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
  getGeneralDashboardData = async (userId: number) => {
    const report: GeneralDashboardReportData = {
      impressions: {},
      reach: {},
    };

    // create an object with used data providers
    const usedDataProvdiers = new Set<ReportMetricSource>();
    for (let i = 0; i < generalReportMetricsConfig.length; i++) {
      const source = generalReportMetricsConfig[i].source;

      usedDataProvdiers.add(source);
    }

    // get metrics only form used data providers
    for (const dataProvierName of usedDataProvdiers.values()) {
      logger.debug(`Reporter: getting data from: ${dataProvierName}`);

      await reportDataProviders[dataProvierName]?.report(
        userId,
        generalReportMetricsConfig.filter(
          (config) => config.source === dataProvierName
        ),
        report
      );
    }

    return report;
  };
}

export const reporter = new Reporter();
