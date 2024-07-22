import { and, eq, gte, sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { googleAdAccountMetrics, NewGoogleAdAccountMetric } from "#db/schema";

export const googleAdAccountMetricDao = {
  getByPageAndMetricId: async (
    accountId: number,
    integrationId: number,
    metricId: string,
    since: Date
  ) => {
    const result = await mysqlDatabase.query.googleAdAccountMetrics.findMany({
      where: and(
        eq(googleAdAccountMetrics.sourceId, accountId),
        eq(googleAdAccountMetrics.integrationId, integrationId),
        eq(googleAdAccountMetrics.metricId, metricId),
        gte(googleAdAccountMetrics.createdAt, since)
      ),
    });

    return result;
  },
  getByPageSince: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase.query.googleAdAccountMetrics.findMany({
      where: and(
        eq(googleAdAccountMetrics.sourceId, accountId),
        eq(googleAdAccountMetrics.integrationId, integrationId),
        gte(googleAdAccountMetrics.createdAt, since)
      ),
    });

    return result;
  },
  createMany: async (newGoogleAdAccountMetrics: NewGoogleAdAccountMetric[]) => {
    const result = await mysqlDatabase
      .insert(googleAdAccountMetrics)
      .values(newGoogleAdAccountMetrics)
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

export type GoogleAdAccountMetricDao = typeof googleAdAccountMetricDao;
