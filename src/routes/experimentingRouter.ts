import { subDays, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import express, { Request, Response, Router } from "express";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { isAdmin } from "#middleware/isAdmin";
import { googleAnalytics } from "#modules/google";
import GoogleAuthLab from "#modules/google/googleAuthLab";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as number | undefined;
    if (!userId) return res.send("Error");

    const integration =
      await googleIntegrationDao.getIntegrationByUserId(userId);

    if (!integration?.selectedPage)
      throw new Error("Ads account is not selected");

    const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");
    const since = toZonedTime(subWeeks(lastDay, 4), "America/New_York");

    const data = await googleAnalytics.pullSourcesData(
      userId,
      integration.selectedPage,
      since,
      lastDay
    );

    res.send(data);
  } catch (error: unknown) {
    handleControllerError(res, error);
  }
});

router.get("/googleauth", isAdmin, async (req: Request, res: Response) => {
  const url = await GoogleAuthLab.getAuthorizedUrl();

  res.status(200).send(url);
});

router.post(
  "/access-token-test",
  isAdmin,
  async (req: Request, res: Response) => {
    const code = req.body.code;
    const userId = req.body.userId;

    const googleAuth = new GoogleAuthLab(userId);

    const tokens = await googleAuth.generateOAuthTokens(code);

    res.status(200).send({
      data: tokens,
    });
  }
);

router.post(
  "/refresh-token-test",
  isAdmin,
  async (req: Request, res: Response) => {
    const userId = req.body.userId;

    const googleAuth = new GoogleAuthLab(userId);

    await googleAuth.loadTokens();

    const tokens = await googleAuth.refreshAccessToken();

    res.status(200).send({
      data: tokens,
    });
  }
);

export { router as experimentingRouter };
