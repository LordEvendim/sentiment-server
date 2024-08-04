import { and, asc, eq, gte, sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import {
  metaAdAccountMetrics,
  NewMetaAdAccountMetric,
} from "#db/schema/metaAdAccountMetrics";

export const metaAdAccountMetricDao = {
  getByPageAndMetricIdOrderByCreatedAt: async (
    accountId: number,
    integrationId: number,
    metricId: string,
    since: Date
  ) => {
    const result = await mysqlDatabase.query.metaAdAccountMetrics.findMany({
      where: and(
        eq(metaAdAccountMetrics.sourceId, accountId),
        eq(metaAdAccountMetrics.integrationId, integrationId),
        eq(metaAdAccountMetrics.metricId, metricId),
        gte(metaAdAccountMetrics.createdAt, since)
      ),
      orderBy: asc(metaAdAccountMetrics.createdAt),
    });

    return result;
  },
  getByPageSince: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase.query.metaAdAccountMetrics.findMany({
      where: and(
        eq(metaAdAccountMetrics.sourceId, accountId),
        eq(metaAdAccountMetrics.integrationId, integrationId),
        gte(metaAdAccountMetrics.createdAt, since)
      ),
    });

    return result;
  },
  createMany: async (newMetaAdAccountMetrics: NewMetaAdAccountMetric[]) => {
    const result = await mysqlDatabase
      .insert(metaAdAccountMetrics)
      .values(newMetaAdAccountMetrics)
      .onDuplicateKeyUpdate({
        set: {
          createdAt: sql`values(created_at)`,
          metricId: sql`values(metric_id)`,
          value: sql`values(value)`,
        },
      });

    return result;
  },
};

export type MetaAdAccountMetricDao = typeof metaAdAccountMetricDao;
