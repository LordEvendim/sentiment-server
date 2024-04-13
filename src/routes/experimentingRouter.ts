import express, { Request, Response, Router } from "express";

import { isAdmin } from "#middleware/isAdmin";
import { reporter } from "#modules/reporter";
import { handleControllerError } from "#utils/errorHandling";
import { metaInsights } from "#modules/meta";
import { subDays, startOfYesterday, format } from "date-fns";
import { metaAds } from "#modules/meta/metaAds";
import { metaIntegrationDao } from "#dao/metaIntegrationDao";

const router: Router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.send("Error");

    // const data = await metaInsights.getPageInsights(
    //   1,
    //   805658772858082,
    //   subDays(startOfYesterday(), 4 * 7),
    //   subDays(startOfYesterday(), 0)
    // );

    // const data = await googleAnalytics.getWeeklyData(1);

    // const metaIntegration = await metaIntegrationDao.getIntegrationByUserId(1);

    // const data = await metaAds.getAdAccountInsights(
    //   1,
    //   metaIntegration!.selectedAdAccount!,
    //   subDays(startOfYesterday(), 4 * 7),
    //   subDays(startOfYesterday(), 0)
    // );
    const data = await reporter.getGeneralDashboardData(1);

    res.send(data);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
