import {
  GeneralDashboardReportData,
  MetricConfig,
  ReportMetricSource,
} from "./types";

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
  id: number;
  integrationId: number;
  period: number;
  sourceId: number;
}

export const appendReportWithData = (
  report: GeneralDashboardReportData,
  metrics: Metric[],
  metricsConfig: MetricConfig[],
  source: ReportMetricSource
) => {
  const metricsConfigMap = getMetricsConfigMap(metricsConfig, source);

  for (let i = 0; i < metrics.length; i++) {
    const metricId = metrics[i].metricId as keyof GeneralDashboardReportData;
    const metricConfig = metricsConfigMap.get(metricId);

    if (!metricConfig) throw new Error("Metric config was not found");
    if (!report[metricId]) report[metricId] = {};

    const datapoint = {
      value: metrics[i].value,
      createdAt: metrics[i].createdAt,
    };

    if (metricConfig.action === "separate") {
      report[metricId][source] = datapoint;
    } else if (metricConfig.action === "aggregate") {
      report[
        metricConfig.aggregatedMetricId as keyof GeneralDashboardReportData
      ][source] = datapoint;
    }
  }
};
