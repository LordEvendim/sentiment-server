import { MetricConfig } from "./types";

export const generalDashboardMetricsConfig: MetricConfig[] = [
  {
    display: "metric",
    id: "spend",
    source: "meta-ads",
    aggregatedMetricId: "spend",
  },
  {
    display: "metric",
    id: "spend",
    source: "google-ads",
    aggregatedMetricId: "spend",
  },
  {
    display: "chart",
    id: "spend",
    source: "meta-ads",
  },
  {
    display: "metric",
    id: "impressions",
    source: "meta-ads",
  },
  {
    display: "metric",
    id: "newUsers",
    source: "google-analytics",
  },
  {
    display: "metric",
    id: "activeUsers",
    source: "google-analytics",
  },
];

export const generalLast4WeeksReportMetricsConfig: MetricConfig[] = [
  {
    display: "metric",
    id: "spend",
    source: "meta-ads",
    aggregatedMetricId: "spend",
  },
  {
    display: "metric",
    id: "spend",
    source: "google-ads",
    aggregatedMetricId: "spend",
  },
  {
    display: "metric",
    id: "impressions",
    source: "meta-ads",
  },
  {
    display: "metric",
    id: "newUsers",
    source: "google-analytics",
  },
  {
    display: "metric",
    id: "activeUsers",
    source: "google-analytics",
  },
];
