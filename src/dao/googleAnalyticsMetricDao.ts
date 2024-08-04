import { and, asc, eq, gte, sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { googleAnalyticsMetrics, NewGoogleAnalyticsMetric } from "#db/schema";

export const googleAnalyticsMetricDao = {
  getByAccountSince: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase.query.googleAnalyticsMetrics.findMany({
      where: and(
        eq(googleAnalyticsMetrics.sourceId, accountId),
        eq(googleAnalyticsMetrics.integrationId, integrationId),
        gte(googleAnalyticsMetrics.createdAt, since)
      ),
    });

    return result;
  },
  getByAccountAndMetricIdOrderByCreatedAt: async (
    accountId: number,
    integrationId: number,
    metricId: string,
    since: Date
  ) => {
    const result = await mysqlDatabase.query.googleAnalyticsMetrics.findMany({
      where: and(
        eq(googleAnalyticsMetrics.sourceId, accountId),
        eq(googleAnalyticsMetrics.integrationId, integrationId),
        eq(googleAnalyticsMetrics.metricId, metricId),
        gte(googleAnalyticsMetrics.createdAt, since)
      ),
      orderBy: asc(googleAnalyticsMetrics.createdAt),
    });

    return result;
  },
  createMany: async (newGoogleAnalyticsMetrics: NewGoogleAnalyticsMetric[]) => {
    const result = await mysqlDatabase
      .insert(googleAnalyticsMetrics)
      .values(newGoogleAnalyticsMetrics)
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

export type GoogleAnalyticsMetricDao = typeof googleAnalyticsMetricDao;
