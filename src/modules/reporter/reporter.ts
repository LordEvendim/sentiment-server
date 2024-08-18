import { endOfYesterday, parse, subDays } from "date-fns";

import { logger } from "#modules/logger";

import { generalDashboardMetricsConfig } from "./metrics";
import { googleAdsDataProvider } from "./providers/googleAdsDataProvider";
import { googleAnalyticsDataProvider } from "./providers/googleAnalyticsDataProvider";
import { metaAdsDataProvider } from "./providers/metaAdsDataProvider";
import { metaInsightsDataProvider } from "./providers/metaInsightsDataProvider";
import {
  GenerativeReportData,
  MetricConfig,
  ReportData,
  ReporterDataProvider,
  ReportMetricSource,
  SelectedMetric,
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
  getChartData = async (
    userId: number,
    metrics: SelectedMetric[],
    since: string
  ) => {
    const sinceDate = parse(since, "yyyyMMdd", Date.now());
    const data: Partial<Record<ReportMetricSource, [number, string][]>> = {};

    for (let i = 0; i < metrics.length; i++) {
      data[metrics[i].source] = await reportDataProviders[
        metrics[i].source
      ]!.metric(userId, metrics[i].metricId, sinceDate);
    }

    return data;
  };
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
  getOverviewData = async (userId: number) => {
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
        report,
        subDays(endOfYesterday(), 7 * 4)
      );
    }

    return report;
  };
  getData = async (userId: number, config: MetricConfig[], since: Date) => {
    const report: GenerativeReportData = [];
    const usedDataProvdiers = new Set<ReportMetricSource>();
    for (let i = 0; i < config.length; i++) {
      const source = config[i].source;

      usedDataProvdiers.add(source);
    }

    for (const dataProvierName of usedDataProvdiers.values()) {
      logger.debug(`Reporter: getting data from: ${dataProvierName}`);

      await reportDataProviders[dataProvierName]?.generativeReport(
        userId,
        config.filter((config) => config.source === dataProvierName),
        report,
        since
      );
    }

    return report;
  };
  getDataSumGroupBySources = async (
    userId: number,
    config: MetricConfig[],
    since: Date
  ) => {
    const report: GenerativeReportData = [];
    const usedDataProvdiers = new Set<ReportMetricSource>();
    for (let i = 0; i < config.length; i++) {
      const source = config[i].source;

      usedDataProvdiers.add(source);
    }

    for (const dataProvierName of usedDataProvdiers.values()) {
      logger.debug(`Reporter: getting data from: ${dataProvierName}`);

      await reportDataProviders[dataProvierName]?.generativeReport(
        userId,
        config.filter((config) => config.source === dataProvierName),
        report,
        since
      );
    }

    const result: Record<string, number> = {};

    for (const datapoint of report) {
      if (result[datapoint.source] === undefined) {
        result[datapoint.source] = datapoint.value;
      } else {
        result[datapoint.source] += datapoint.value;
      }
    }

    return result;
  };
}

export const reporter = new Reporter();
