import express, { Request, Response, Router } from "express";

import { isAdmin } from "#middleware/isAdmin";
import { logger } from "#modules/logger";
import { metaAds } from "#modules/meta/metaAds";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.send("Error");

    // const data = await googleAnalytics.pullLastDayData(1);

    const data = await metaAds.pullLastDayData(1);

    res.send(data);
  } catch (error: unknown) {
    logger.error("Handling exp error");
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
