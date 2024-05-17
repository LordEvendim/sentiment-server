import { MetricConfig, ReportData, ReportMetricSource } from "./types";

export const getMetricsConfigMap = (
  metrics: MetricConfig[],
  source: ReportMetricSource
) => {
  const trackedMetrics = metrics.filter((metric) => metric.source === source);
  const trackedMetricsMap: Map<string, MetricConfig> = new Map();

  for (let i = 0; i < trackedMetrics.length; i++) {
    trackedMetricsMap.set(trackedMetrics[i].id, trackedMetrics[i]);
  }

  return trackedMetricsMap;
};

interface Metric {
  metricId: string;
  value: number;
  createdAt: Date;
  integrationId: number;
  period: number;
  sourceId: number;
}

export const appendReportWithData = (
  report: ReportData,
  metrics: Metric[],
  metricsConfig: MetricConfig[],
  source: ReportMetricSource
) => {
  const metricsConfigMap = getMetricsConfigMap(metricsConfig, source);
  const values = new Map<string, number>();

  // aggregate metrics
  for (let i = 0; i < metrics.length; i++) {
    const metricId = metrics[i].metricId;
    const metricConfig = metricsConfigMap.get(metricId);

    if (!metricConfig) continue;

    const targetMetricId = metricConfig.aggregatedMetricId ?? metricConfig.id;

    values.set(
      targetMetricId,
      values.has(targetMetricId)
        ? values.get(targetMetricId)! + metrics[i].value
        : metrics[i].value
    );
  }

  // append report data
  for (const [metricId, value] of values.entries()) {
    const metricConfig = metricsConfigMap.get(metricId)!;

    report.push({
      metricId: metricConfig.aggregatedMetricId ?? metricConfig.id,
      value,
      source,
    });
  }
};
