import express, { Request, Response, Router } from "express";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { isAdmin } from "#middleware/isAdmin";
import { generativeReporter } from "#modules/reporter";
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
    const data = await generativeReporter.generateWeeklyReport(userId);

    res.send(data);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
