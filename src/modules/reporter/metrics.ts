import { MetricConfig } from "./types";

export const generalReportMetricsConfig: MetricConfig[] = [
  {
    id: "impressions",
    source: "meta-insights",
    action: "separate",
  },
  {
    id: "spend",
    source: "meta-ads",
    action: "aggregate",
    aggregatedMetricId: "spend",
  },
];
