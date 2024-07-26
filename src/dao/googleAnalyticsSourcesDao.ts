import { sql } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import {
  googleAnalyticsSources,
  NewGoogleAnalyticsSources,
} from "#db/schema/googleAnalyticsSources";

export const googleAnalyticsSourceDao = {
  getByAccountSinceGroupBySource: async (
    accountId: number,
    integrationId: number,
    since: Date
  ) => {
    const result = await mysqlDatabase.execute(sql`
      SELECT t.created_at, t.source, t.sessions
      FROM google_analytics_sources AS t
      INNER JOIN
        (SELECT source, SUM(sessions) as sessions FROM google_analytics_sources
        WHERE source_id = ${accountId} AND integration_id = ${integrationId} AND created_at >= ${since}
        GROUP BY source
        ORDER BY sessions desc
        LIMIT 5) AS t2
      ON t.source = t2.source
      WHERE source_id = ${accountId} AND integration_id = ${integrationId} AND created_at >= ${since}
      ORDER BY t.created_at ASC, t.sessions ASC
      `);

    return result[0];
  },
  createMany: async (
    newGoogleAnalyticsSources: NewGoogleAnalyticsSources[]
  ) => {
    const result = await mysqlDatabase
      .insert(googleAnalyticsSources)
      .values(newGoogleAnalyticsSources)
      .onDuplicateKeyUpdate({
        set: {
          createdAt: sql`values(created_at)`,
          source: sql`values(source)`,
          sessions: sql`values(sessions)`,
        },
      });

    return result;
  },
};

export type GoogleAnalyticsSourceDao = typeof googleAnalyticsSourceDao;
