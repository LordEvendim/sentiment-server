export type ReportMetricSource =
  | "meta-insights"
  | "meta-ads"
  | "google-analytics"
  | "google-ads";

export type MetricConfig = {
  id: string;
  source: ReportMetricSource;
  aggregatedMetricId?: string;
};

export type MetricDatapoint = {
  value: number;
  date: Date;
};

export type ReportData = {
  metricId: string;
  source: ReportMetricSource;
  value: number;
}[];

export type GenerativeReportData = {
  metricId: string;
  source: ReportMetricSource;
  value: number;
  createdAt: Date;
}[];

export interface ReporterDataProvider {
  report(
    userId: number,
    metrics: MetricConfig[],
    report: ReportData
  ): Promise<void>;
}
