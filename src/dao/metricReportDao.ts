import { and, desc, eq } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { metricReports, NewMetricReport } from "#db/schema/MetricReports";

export const metricReportDao = {
  getLatestByUserIdTimeframeAndTimeframe: async (
    userId: number,
    timeframe: string,
    name: string
  ) => {
    const result = await mysqlDatabase
      .select()
      .from(metricReports)
      .where(
        and(
          eq(metricReports.name, name),
          eq(metricReports.ownerId, userId),
          eq(metricReports.timeframe, timeframe)
        )
      )
      .orderBy(desc(metricReports.createdAt));

    return result[0];
  },
  create: async (newReport: NewMetricReport) => {
    const result = await mysqlDatabase.insert(metricReports).values(newReport);

    return result;
  },
};

export type MetricReportDao = typeof metricReportDao;
