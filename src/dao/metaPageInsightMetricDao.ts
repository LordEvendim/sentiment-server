import { planetScaleDB } from "src/db/planetscale";

import { metaPageInsightMetrics, NewMetaPageInsightMetric } from "#db/schema";

export const metaPageInsightMetricDao = {
  create: async (newMetaPageInsightMetric: NewMetaPageInsightMetric) => {
    const result = await planetScaleDB
      .insert(metaPageInsightMetrics)
      .values(newMetaPageInsightMetric);

    return result;
  },
  createMany: async (newMetaPageInsightMetrics: NewMetaPageInsightMetric[]) => {
    const result = await planetScaleDB
      .insert(metaPageInsightMetrics)
      .values(newMetaPageInsightMetrics);

    return result;
  },
};

export type MetaPageInsightMetricDao = typeof metaPageInsightMetricDao;
