import express, { Request, Response, Router } from "express";

import { isAdmin } from "#middleware/isAdmin";
import { generativeReporter } from "#modules/reporter";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as number | undefined;
    if (!userId) return res.send("Error");

    // const data = await googleAnalytics.pullLastDayData(1);

    const data = await generativeReporter.generateWeeklyReport(userId);

    // const data = await googleAds.pullLastDayData(1);
    // await queueProducer.sendMessage("pull", { userId: 1 });
    // const data = {};

    // const data = await reporter.getGeneralDashboardData(1);
    // const data = await gemini.getTextResponse("How's the weather?");

    res.send(data);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
