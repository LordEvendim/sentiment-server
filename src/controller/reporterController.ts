import { Response } from "express";

import { selectedUserPage } from "#modules/meta/tempStorage";
import { reporter } from "#modules/reporter";
import { weeklyPageReports } from "#modules/reporter/tempStorage";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createReporterController = () => {
  return {
    generateWeeklyPageReport: async (
      req: TypedRequest<object, { pageId: string }>,
      res: Response<string>
    ) => {
      try {
        const { user } = req.session;
        const pageId = selectedUserPage[user?.id ?? ""];

        console.log("userid");
        console.log(user?.id);
        console.log(pageId);

        if (!pageId) throw new Error("User has no selected page");
        if (!user) throw new Error("User not authenticated");

        const result = await reporter.generateWeeklyPageReport(
          user.id.toString(),
          pageId
        );

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getWeeklyPageReport: async (
      req: TypedRequest<object, { pageId: string }>,
      res: Response<string>
    ) => {
      try {
        const { pageId } = req.params;
        const { user } = req.session;

        if (!pageId) throw new Error("Invalid request");
        if (!user) throw new Error("User not authenticated");

        const report = weeklyPageReports[pageId];

        if (!report) throw new Error("Report not found");

        return res.status(200).send(report);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const reporterController = createReporterController();
