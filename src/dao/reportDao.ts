import { and, desc, eq } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { NewReport, reports } from "#db/schema";

export const reportDao = {
  getLatestByUserIdAndTimeframe: async (userId: number, timeframe: string) => {
    const result = await mysqlDatabase
      .select()
      .from(reports)
      .where(and(eq(reports.ownerId, userId), eq(reports.timeframe, timeframe)))
      .orderBy(desc(reports.createdAt));

    return result[0];
  },
  create: async (newReport: NewReport) => {
    const result = await mysqlDatabase.insert(reports).values(newReport);

    return result;
  },
};

export type ReportDao = typeof reportDao;
