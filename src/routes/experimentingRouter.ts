import { subDays, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import express, { Request, Response, Router } from "express";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { isAdmin } from "#middleware/isAdmin";
import { metaAds } from "#modules/meta/metaAds";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as number | undefined;
    if (!userId) return res.send("Error");

    // const data = await googleAnalytics.pullLastDayData(1);

    // const data = await generativeReporter.generateWeeklyReport(userId);

    // const data = await googleAds.pullLastDayData(1);
    // await queueProducer.sendMessage("pull", { userId: 1 });
    // const data = {};

    // const data = await reporter.getGeneralDashboardData(1);
    // const data = await gemini.getTextResponse("How's the weather?");
    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration?.selectedAdAccount)
      throw new Error("Ad account not selected");

    // const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");
    // const since = toZonedTime(subWeeks(lastDay, 1), "America/New_York");

    // const data = await metaAds.pullTopCampaigns(
    //   1,
    //   integration.selectedAdAccount,
    //   since,
    //   lastDay
    // );

    const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");
    const since = toZonedTime(subWeeks(lastDay, 1), "America/New_York");
    const data = await metaAds.getTopCampaigns(1, since);

    res.send(data);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
