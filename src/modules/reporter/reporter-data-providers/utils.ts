import { MetricConfig, ReportMetricSource } from "../types";

export const getTrackedMetricsConfigs = (
  metrics: MetricConfig[],
  source: ReportMetricSource
) => {
  const trackedMetrics = metrics.filter((metric) => metric.source === source);
  const trackedMetaAdsMetricIds = trackedMetrics.map((metric) => metric.id);
  const trackedMetricsSet = new Set(trackedMetaAdsMetricIds);
  const trackedMetricsMap: Record<string, MetricConfig> = {};

  for (let i = 0; i < trackedMetrics.length; i++) {
    trackedMetricsMap[trackedMetrics[i].id] = trackedMetrics[i];
  }

  return [trackedMetricsSet, trackedMetricsMap] as const;
};
