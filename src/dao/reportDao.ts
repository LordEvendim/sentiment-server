import { eq } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { NewReport, reports } from "#db/schema";

export const reportDao = {
  getByUserId: async (userId: number) => {
    const result = await mysqlDatabase.query.reports.findFirst({
      where: eq(reports.ownerId, userId),
    });

    return result;
  },
  create: async (newReport: NewReport) => {
    const result = await mysqlDatabase.insert(reports).values(newReport);

    return result;
  },
};

export type ReportDao = typeof reportDao;
