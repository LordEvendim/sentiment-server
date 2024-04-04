import { and, eq, gte, sql } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { metaInsightsMetrics, NewMetaInsightsMetric } from "#db/schema";

export const metaInsightsMetricDao = {
  getByPageSince: async (
    pageId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await planetScaleDB.query.metaInsightsMetrics.findMany({
      where: and(
        eq(metaInsightsMetrics.sourceId, pageId),
        eq(metaInsightsMetrics.integrationId, integrationId),
        gte(metaInsightsMetrics.createdAt, since)
      ),
    });

    return result;
  },
  createMany: async (newMetaInsightsMetrics: NewMetaInsightsMetric[]) => {
    const result = await planetScaleDB
      .insert(metaInsightsMetrics)
      .values(newMetaInsightsMetrics)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });

    return result;
  },
};

export type MetaInsightsMetricDao = typeof metaInsightsMetricDao;
