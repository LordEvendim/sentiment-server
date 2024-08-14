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
  | {
      type: "cumulative";
      prompt: string;
      metrics: MetricConfig[];
      campaignMetrics?: {
        google?: string;
        meta?: string;
      };
    }
  | {
      type: "average";
      prompt: string;
      dividentMetrics: MetricConfig[];
      divisorMetrics: MetricConfig[];
      campaignMetrics: {
        divident: {
          google: string;
          meta: string;
        };
        divisor: {
          google: string;
          meta: string;
        };
      };
    }
> = {
  impressions: {
    type: "cumulative",
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
    campaignMetrics: {
      google: "impressions",
      meta: "impressions",
    },
  },
  clicks: {
    type: "cumulative",
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
    campaignMetrics: {
      google: "clicks",
      meta: "clicks",
    },
  },
  cpc: {
    type: "average",
    prompt: `Prompt: Regarding CPC performance, provide a breakdown of which channels and campaigns drove the most success and which were the most significant losers based on the selected time period. Write answer using a maximum of 5 or 6 sentences.
      Output Instructions: format the output in this example manner: This week, CPC on Google Ads campaigns increased by 15%, and Meta campaigns Click were down 9%; in particular, campaign name {X} had the most decline from the other ads 24%).`,
    dividentMetrics: [
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
    divisorMetrics: [
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
    campaignMetrics: {
      divident: {
        google: "spend",
        meta: "spend",
      },
      divisor: {
        google: "clicks",
        meta: "clicks",
      },
    },
  },
  spend: {
    type: "cumulative",
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
    campaignMetrics: {
      google: "spend",
      meta: "spend",
    },
  },
  ctr: {
    type: "average",
    prompt: `Prompt: Regarding CTR performance, provide a breakdown of which channels and campaigns drove the most success and which were the most significant losers based on the selected time period. Write answer using a maximum of 5 or 6 sentences.
      Output Instructions: format the output in this example manner: This week, CTR on Google Ads campaigns increased by 15%, and Meta campaigns Click were down 9%; in particular, campaign name {X} had the most decline from the other ads 24%).`,
    dividentMetrics: [
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
    divisorMetrics: [
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
    campaignMetrics: {
      divident: {
        google: "clicks",
        meta: "clicks",
      },
      divisor: {
        google: "impressions",
        meta: "impressions",
      },
    },
  },
  sessions: {
    type: "cumulative",
    prompt: `Prompt: Analyze the changes in website sessions. Write answer using a maximum of 5 or 6 sentences.
      Output Instructions: Format the output similarly to this example: Website sessions increased by 15% in the last period compared to the current period. This decrease is not significant compared to current levels.`,
    metrics: [
      {
        display: "metric",
        id: "sessions",
        source: "google-analytics",
      },
    ],
  },
  conversions: {
    type: "cumulative",
    prompt: `Prompt: Analyze the changes in conversions. Write answer using a maximum of 5 or 6 sentences.
      Output Instructions: Format the output similarly to this example: conversions increased by 15% in the last period compared to the current period. This decrease is not significant compared to current levels.`,
    metrics: [
      {
        display: "metric",
        id: "all_conversions",
        source: "google-ads",
      },
    ],
  },
  conversionRate: {
    type: "average",
    prompt: `Prompt: Regarding conversion rate performance, provide a breakdown of which channels and campaigns drove the most success and which were the most significant losers based on the selected time period. Write answer using a maximum of 5 or 6 sentences.
      Output Instructions: format the output in this example manner: This week, CTR on Google Ads campaigns increased by 15%, and Meta campaigns Click were down 9%; in particular, campaign name {X} had the most decline from the other ads 24%).`,
    dividentMetrics: [
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
    divisorMetrics: [
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
    campaignMetrics: {
      divident: {
        google: "clicks",
        meta: "clicks",
      },
      divisor: {
        google: "interactions",
        meta: "impressions",
      },
    },
  },
};

// [x] Spend
// [x] Impressions
// [x] Clicks
// [x] CPC
// [x] Conversions
// [x] Website Sessions
// [x] CTR
// [x] Conversion Rate

// [-] CPA
// [-] Bounce Rate
