import { MetricConfig } from "./types";

export const generalReportMetricsConfig: MetricConfig[] = [
  {
    id: "impressions",
    source: "meta-insights",
  },
  {
    id: "spend",
    source: "meta-ads",
    aggregatedMetricId: "spend",
  },
];
