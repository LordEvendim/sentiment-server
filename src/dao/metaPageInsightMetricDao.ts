import { planetScaleDB } from "src/db/planetscale";

import { metaPageInsightMetrics, NewMetaPageInsightMetric } from "#db/schema";

const metaPageInsightMetricDao = {
  create: async (newMetaPageInsightMetric: NewMetaPageInsightMetric) => {
    const result = await planetScaleDB
      .insert(metaPageInsightMetrics)
      .values(newMetaPageInsightMetric);

    return result;
  },
};

export type MetaPageInsightMetricDao = typeof metaPageInsightMetricDao;
