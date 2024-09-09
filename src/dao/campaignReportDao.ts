import { and, desc, eq } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { campaignReports, NewCampaignReport } from "#db/schema/campaignReports";

export const campaignReportDao = {
  getLatestByUserIdTimeframe: async (userId: number, timeframe: string) => {
    const result = await mysqlDatabase
      .select()
      .from(campaignReports)
      .where(
        and(
          eq(campaignReports.ownerId, userId),
          eq(campaignReports.timeframe, timeframe)
        )
      )
      .orderBy(desc(campaignReports.createdAt));

    return result[0];
  },
  create: async (newReport: NewCampaignReport) => {
    const result = await mysqlDatabase
      .insert(campaignReports)
      .values(newReport);

    return result;
  },
};

export type CampaignReportDao = typeof campaignReportDao;
