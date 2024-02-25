import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { NewReport, reports } from "#db/schema";

export const reportDao = {
  getByUserId: async (userId: number) => {
    const result = await planetScaleDB.query.reports.findFirst({
      where: eq(reports.ownerId, userId),
    });

    return result;
  },
  create: async (newReport: NewReport) => {
    const result = await planetScaleDB.insert(reports).values(newReport);

    return result;
  },
};

export type ReportDao = typeof reportDao;
