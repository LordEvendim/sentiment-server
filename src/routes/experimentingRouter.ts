import { subDays } from "date-fns";
import express, { Request, Response, Router } from "express";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { isAdmin } from "#middleware/isAdmin";
import { googleAds } from "#modules/google/googleAds";
import GoogleAuthLab from "#modules/google/googleAuthLab";
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

    const until = new Date(Date.now());
    const since = subDays(until, 7);

    const data = await googleAds.pullAccountMetrics(
      userId,
      integration.selectedAdAccount,
      since,
      until
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
