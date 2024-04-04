export type ReportMetricSource =
  | "meta-insights"
  | "meta-ads"
  | "google-analytics"
  | "google-ads";

export type MetricConfig =
  | {
      id: string;
      source: ReportMetricSource;
      action: "separate";
    }
  | {
      id: string;
      source: ReportMetricSource;
      action: "aggregate";
      aggregatedMetricId: string;
    };

export type MetricDataPoint = {
  value: number;
  createdAt: Date;
};

export interface GeneralDashboardReportData {
  impressions: {
    [provider in ReportMetricSource]?: MetricDataPoint;
  };
  reach: {
    [provider in ReportMetricSource]?: MetricDataPoint;
  };
}

export interface ReporterDataProvider {
  report(
    userId: number,
    metrics: MetricConfig[],
    report: GeneralDashboardReportData
  ): Promise<void>;
}
