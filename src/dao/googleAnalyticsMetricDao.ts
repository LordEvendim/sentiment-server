import { sql } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { googleAnalyticsMetrics, NewGoogleAnalyticsMetric } from "#db/schema";

export const googleAnalyticsMetricDao = {
  createMany: async (newGoogleAnalyticsMetrics: NewGoogleAnalyticsMetric[]) => {
    const result = await planetScaleDB
      .insert(googleAnalyticsMetrics)
      .values(newGoogleAnalyticsMetrics)
      .onDuplicateKeyUpdate({ set: { id: sql`id` } });

    return result;
  },
};

export type GoogleAnalyticsMetricDao = typeof googleAnalyticsMetricDao;
