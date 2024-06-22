import express, { Request, Response, Router } from "express";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import { isAdmin } from "#middleware/isAdmin";
import GoogleAuthLab from "#modules/google/googleAuthLab";
import { handleControllerError } from "#utils/errorHandling";

const router: Router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as number | undefined;
    if (!userId) return res.send("Error");

    const integration = await metaIntegrationDao.getIntegrationByUserId(userId);

    if (!integration?.selectedAdAccount)
      throw new Error("Ad account not selected");

    if (!integration) throw new Error("Meta: integration not connected");
    if (!integration.selectedAdAccount)
      throw new Error("Meta: ad account not selected");

    const data = {};

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
