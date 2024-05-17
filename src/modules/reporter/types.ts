export type ReportMetricSource =
  | "meta-insights"
  | "meta-ads"
  | "google-analytics"
  | "google-ads";

export type MetricConfig = {
  display: "chart" | "metric";
  id: string;
  source: ReportMetricSource;
  aggregatedMetricId?: string;
};

export type MetricDatapoint = {
  value: number;
  date: Date;
};

export type ReportData = (
  | {
      display: "metric";
      metricId: string;
      source: ReportMetricSource;
      value: number;
    }
  | {
      display: "chart";
      metricId: string;
      source: ReportMetricSource;
      values: [number, number][];
    }
)[];

export type GenerativeReportData = {
  display: "metric";
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
