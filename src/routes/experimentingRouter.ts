import { startOfYesterday, subDays } from "date-fns";
import express, { Request, Response, Router } from "express";

import { isAdmin } from "#middleware/isAdmin";
import { metaInsights } from "#modules/meta";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.send("Error");

    const data = await metaInsights.getPageInsights(
      1,
      805658772858082,
      subDays(startOfYesterday(), 7 * 4),
      subDays(startOfYesterday(), 0)
    );
    // const data = format(startOfYesterday(), "yyyy-MM-dd");
    // const data = await googleAnalytics.getWeeklyData(1);

    res.send(data);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
