import { and, eq, gte, sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { metaInsightsMetrics, NewMetaInsightsMetric } from "#db/schema";

export const metaInsightsMetricDao = {
  getByPageSince: async (
    pageId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase.query.metaInsightsMetrics.findMany({
      where: and(
        eq(metaInsightsMetrics.sourceId, pageId),
        eq(metaInsightsMetrics.integrationId, integrationId),
        gte(metaInsightsMetrics.createdAt, since)
      ),
    });

    return result;
  },
  createMany: async (newMetaInsightsMetrics: NewMetaInsightsMetric[]) => {
    const result = await mysqlDatabase
      .insert(metaInsightsMetrics)
      .values(newMetaInsightsMetrics)
      .onDuplicateKeyUpdate({
        set: {
          createdAt: sql`values(created_at)`,
          metricId: sql`values(metric_id)`,
        },
      });

    return result;
  },
};

export type MetaInsightsMetricDao = typeof metaInsightsMetricDao;
