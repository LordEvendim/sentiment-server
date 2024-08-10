import express, { Request, Response, Router } from "express";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { isAdmin } from "#middleware/isAdmin";
import { generativeReporter } from "#modules/reporter";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as number | undefined;
    if (!userId) return res.send("Error");

    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration?.selectedAdAccount)
      throw new Error("Ads account is not selected");

    // const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");
    // const since = toZonedTime(subWeeks(lastDay, 4), "America/New_York");

    const result = await generativeReporter.generateMetricReport(
      userId,
      "spend",
      "last-14-days",
      "20240808"
    );

    res.send(result);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

export { router as experimentingRouter };
