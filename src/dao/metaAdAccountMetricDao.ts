import { sql } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import {
  metaAdAccountMetrics,
  NewMetaAdAccountMetric,
} from "#db/schema/metaAdAccountMetrics";

export const metaAdAccountMetricDao = {
  createMany: async (newMetaAdAccountMetrics: NewMetaAdAccountMetric[]) => {
    const result = await planetScaleDB
      .insert(metaAdAccountMetrics)
      .values(newMetaAdAccountMetrics)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });

    return result;
  },
};

export type MetaAdAccountMetricDao = typeof metaAdAccountMetricDao;
