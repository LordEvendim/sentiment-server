import { sql } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { metaInsightsMetrics, NewMetaInsightsMetric } from "#db/schema";

export const metaInsightsMetricDao = {
  createMany: async (newMetaInsightsMetrics: NewMetaInsightsMetric[]) => {
    const result = await planetScaleDB
      .insert(metaInsightsMetrics)
      .values(newMetaInsightsMetrics)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });

    return result;
  },
};

export type MetaInsightsMetricDao = typeof metaInsightsMetricDao;
