import { Response } from "express";

import { generativeReporter, reporter } from "#modules/reporter";
import { ReportData } from "#modules/reporter/types";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createReporterController = () => {
  return {
    generateWeeklyPageReport: async (
      req: TypedRequest<object>,
      res: Response<string>
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
    getWeeklyPageReport: async (
      req: TypedRequest<object, { pageId: string }>,
      res: Response<string | undefined>
    ) => {
      try {
        const { user } = req.session;

        if (!user) throw new Error("User not authenticated");

        const report = await generativeReporter.getWeeklyPageReport(user.id);

        return res.status(200).send(report?.data);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getGeneralDashboardData: async (
      req: TypedRequest<object, object>,
      res: Response<ReportData | undefined>
    ) => {
      try {
        const { user } = req.session;

        if (!user) throw new Error("User not authenticated");

        const report = await reporter.getGeneralDashboardData(user.id);

        return res.status(200).send(report);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const reporterController = createReporterController();
