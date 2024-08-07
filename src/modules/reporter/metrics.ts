import { prompts } from "./prompts";
import { MetricConfig } from "./types";

export const generalDashboardMetricsConfig: MetricConfig[] = [
  {
    display: "metric",
    id: "spend",
    source: "meta-ads",
  },
  {
    display: "metric",
    id: "cost_micros",
    source: "google-ads",
  },
  {
    display: "metric",
    id: "clicks",
    source: "google-ads",
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
    id: "impressions",
    source: "google-ads",
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
    id: "sessions",
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

export const metricReportConfigs: Record<
  string,
  { prompt: string; metrics: MetricConfig[] }
> = {
  impressions: {
    prompt: `Prompt: Analyze which channels and campaigns saw the highest swings in terms of advertising impressions. Write answer using a maximum of 5 or 6 sentences.
      Output Instructions: Format the output similarly to this example: Google Ads had the highest number of impressions (and outlined the top three campaigns greatest to least).`,
    metrics: [
      {
        display: "metric",
        id: "impressions",
        source: "meta-ads",
      },
      {
        display: "metric",
        id: "impressions",
        source: "google-ads",
      },
    ],
  },
  clicks: {
    prompt: prompts.getMetricReportPrompt("clicks"),
    metrics: [
      {
        display: "metric",
        id: "clicks",
        source: "meta-ads",
      },
      {
        display: "metric",
        id: "clicks",
        source: "google-ads",
      },
    ],
  },
  cpc: {
    prompt: `Prompt: Regarding CPC performance, provide a breakdown of which channels and campaigns drove the most success and which were the most significant losers based on the selected time period. Write answer using a maximum of 5 or 6 sentences.
      Output Instructions: format the output in this example manner: This week, CPC on Google Ads campaigns increased by -15%, and Meta campaigns Click were down -9%; in particular, campaign name {X} had the most decline from the other ads -24%).`,
    metrics: [
      {
        display: "metric",
        id: "cpc",
        source: "meta-ads",
      },
    ],
  },
  spend: {
    prompt: `Prompt: Analyze which channels and campaigns saw the highest swings in terms of advertising costs. Write answer using a maximum of 5 or 6 sentences.
      Output Instructions: Format the output similarly to this example: Google Ads had the highest spending costs (and outlined the top three campaigns greatest to least).`,
    metrics: [
      {
        display: "metric",
        id: "spend",
        source: "meta-ads",
      },
      {
        display: "metric",
        id: "cost_micros",
        source: "google-ads",
      },
    ],
  },
};
