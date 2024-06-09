import { subDays, subYears } from "date-fns";
import { Response } from "express";

import { NewReport, Report } from "#db/schema";
import { generativeReporter, reporter } from "#modules/reporter";
import { ReportData } from "#modules/reporter/types";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createReporterController = () => {
  return {
    generateGeneralReport: async (
      req: TypedRequest<object>,
      res: Response<NewReport>
    ) => {
      try {
        const { user } = req.session;

        if (!user) throw new Error("User not authenticated");

        const result = await generativeReporter.generateWeeklyReport(user.id);

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getGeneralReport: async (
      req: TypedRequest<object, { pageId: string }>,
      res: Response<Report | undefined>
    ) => {
      try {
        const { user } = req.session;

        if (!user) throw new Error("User not authenticated");

        const report = await generativeReporter.getWeeklyReport(user.id);

        return res.status(200).send(report);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getGeneralDashboardData: async (
      req: TypedRequest<object, object, { since: string }>,
      res: Response<ReportData | undefined>
    ) => {
      try {
        const { user } = req.session;

        if (!user) throw new Error("User not authenticated");
        if (!req.query.since) throw new Error("Timeframe not specified");

        const since =
          parseInt(req.query.since) ?? subDays(Date.now(), 7 + 1).getTime();

        if (since < subYears(Date.now(), 2).getTime())
          throw new Error("Timeframe out of range");

        console.log(new Date(since).toLocaleDateString());

        const report = await reporter.getGeneralDashboardData(user.id, since);

        return res.status(200).send(report);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const reporterController = createReporterController();
