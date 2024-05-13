import { MetricConfig } from "./types";

export const generalDashboardMetricsConfig: MetricConfig[] = [
  {
    id: "spend",
    source: "meta-ads",
    aggregatedMetricId: "spend",
  },
  {
    id: "spend",
    source: "google-ads",
    aggregatedMetricId: "spend",
  },
  {
    id: "impressions",
    source: "meta-ads",
  },
  {
    id: "newUsers",
    source: "google-analytics",
  },
  {
    id: "activeUsers",
    source: "google-analytics",
  },
];

export const generalLast4WeeksReportMetricsConfig: MetricConfig[] = [
  {
    id: "spend",
    source: "meta-ads",
    aggregatedMetricId: "spend",
  },
  {
    id: "spend",
    source: "google-ads",
    aggregatedMetricId: "spend",
  },
  {
    id: "impressions",
    source: "meta-ads",
  },
  {
    id: "newUsers",
    source: "google-analytics",
  },
  {
    id: "activeUsers",
    source: "google-analytics",
  },
];
