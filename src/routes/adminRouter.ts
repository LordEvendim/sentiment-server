import express, { Request, Response, Router } from "express";

import { isAdmin } from "#middleware/isAdmin";
import { googleAnalytics } from "#modules/google";
import { googleAds } from "#modules/google/googleAds";
import { metaInsights } from "#modules/meta";
import { metaAds } from "#modules/meta/metaAds";
import { userModule } from "#modules/user/user";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.post("/update-session", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    if (!userId) throw new Error("Invlid request");

    await userModule.updateSession(req.body.userId);

    res.send({
      message: "OK",
    });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

router.post("/pull-initial", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as number | undefined;
    if (!userId) return res.send("userId not defined");

    try {
      await metaAds.pullLastFourWeeks(userId);
    } catch (e) {
      /* empty */
    }

    try {
      await metaInsights.pullLastFourWeeks(userId);
    } catch (e) {
      /* empty */
    }

    try {
      await googleAnalytics.pullLastFourWeeks(userId);
    } catch (e) {
      /* empty */
    }

    try {
      await googleAds.pullLastFourWeeks(userId);
    } catch (e) {
      /* empty */
    }

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

    try {
      await metaAds.pullLastDayData(userId);
    } catch (e) {
      /* empty */
    }

    try {
      await metaInsights.pullLastDayData(userId);
    } catch (e) {
      /* empty */
    }

    try {
      await googleAnalytics.pullLastDayData(userId);
    } catch (e) {
      /* empty */
    }

    try {
      await googleAds.pullLastDayData(userId);
    } catch (e) {
      /* empty */
    }

    res.send({
      message: "OK",
    });
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as adminRouter };
