import { subDays } from "date-fns";
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
    // const data = await generativeReporter.generateWeeklyReport(userId);
    if (!integration) throw new Error("Meta: integration not connected");
    if (!integration.selectedAdAccount)
      throw new Error("Meta: ad account not selected");

    const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");

    // const data = await meta.getAdAccountInsights(
    //   userId,
    //   integration.selectedAdAccount,
    //   lastDay,
    //   lastDay
    // );

    const data = await metaAds.pullTopCampaigns(
      userId,
      integration.selectedAdAccount,
      lastDay,
      lastDay
    );

    res.send(data);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
