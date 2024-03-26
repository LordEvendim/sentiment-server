import { and, eq, gte, sql } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import {
  metaAdAccountMetrics,
  NewMetaAdAccountMetric,
} from "#db/schema/metaAdAccountMetrics";

export const metaAdAccountMetricDao = {
  getByPageSince: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await planetScaleDB.query.metaAdAccountMetrics.findMany({
      where: and(
        eq(metaAdAccountMetrics.sourceId, accountId),
        eq(metaAdAccountMetrics.integrationId, integrationId),
        gte(metaAdAccountMetrics.createdAt, since)
      ),
    });

    return result;
  },
  createMany: async (newMetaAdAccountMetrics: NewMetaAdAccountMetric[]) => {
    const result = await planetScaleDB
      .insert(metaAdAccountMetrics)
      .values(newMetaAdAccountMetrics)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });

    return result;
  },
};

export type MetaAdAccountMetricDao = typeof metaAdAccountMetricDao;
