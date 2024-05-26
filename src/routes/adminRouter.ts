import express, { Request, Response, Router } from "express";

import { isAdmin } from "#middleware/isAdmin";
import { metaInsights } from "#modules/meta";
import { metaAds } from "#modules/meta/metaAds";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.post("/pull-initial", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as number | undefined;
    if (!userId) return res.send("userId not defined");

    await metaAds.pullLastFourWeeks(userId);
    await metaInsights.pullLastFourWeeks(userId);

    // await googleAnalytics.pullLastFourWeeks(userId);
    // await googleAds.pullLastFourWeeks(userId);

    res.send({
      message: "OK",
    });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

router.post("/pull-day", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as number | undefined;
    if (!userId) return res.send("userId not defined");

    await metaAds.pullLastDayData(userId);
    await metaInsights.pullLastDayData(userId);

    // await googleAnalytics.pullLastFourWeeks(userId);
    // await googleAds.pullLastFourWeeks(userId);

    res.send({
      message: "OK",
    });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as adminRouter };
