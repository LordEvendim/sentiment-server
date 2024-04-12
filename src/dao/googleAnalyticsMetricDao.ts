import { and, eq, gte, sql } from "drizzle-orm";

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
  createMany: async (newGoogleAnalyticsMetrics: NewGoogleAnalyticsMetric[]) => {
    const result = await mysqlDatabase
      .insert(googleAnalyticsMetrics)
      .values(newGoogleAnalyticsMetrics)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });

    return result;
  },
};

export type GoogleAnalyticsMetricDao = typeof googleAnalyticsMetricDao;
