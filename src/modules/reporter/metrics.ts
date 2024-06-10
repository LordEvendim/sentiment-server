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
    id: "page_impressions",
    source: "meta-insights",
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
  {
    display: "metric",
    id: "cpc",
    source: "meta-ads",
  },
  {
    display: "metric",
    id: "clicks",
    source: "meta-ads",
  },
];

export const generativeGeneralLast4WeeksReportMetricsConfig: MetricConfig[] = [
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
