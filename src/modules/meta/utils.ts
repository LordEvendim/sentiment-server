import { MetricPeriod } from "./types";

export const metaMetricPeriodToDays: Record<MetricPeriod, number> = {
  day: 1,
  days_28: 28,
  week: 7,
  lifetime: 0,
};
