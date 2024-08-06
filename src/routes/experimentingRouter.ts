import { subDays, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import express, { Request, Response, Router } from "express";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { isAdmin } from "#middleware/isAdmin";
import { gemini } from "#modules/gemini";
import { googleAds } from "#modules/google/googleAds";
import GoogleAuthLab from "#modules/google/googleAuthLab";
import { metaAds } from "#modules/meta/metaAds";
import { reporter } from "#modules/reporter";
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

    const lastDay = toZonedTime(subDays(Date.now(), 1), "America/New_York");
    const since = toZonedTime(subWeeks(lastDay, 4), "America/New_York");

    const prompt =
      "Prompt: Regarding CPC performance, provide a breakdown of which channels and campaigns drove the most success and which were the most significant losers based on the selected time period. Output Instructions: format the output in this example manner: This week, CPC on Google Ads campaigns increased by -15%, and Meta campaigns Click were down -9%; in particular, campaign name {X} had the most decline from the other ads -24%).";

    const googleCampaigns = await googleAds.getTopCampaigns(userId, since);
    const metaCampaigns = await metaAds.getTopCampaigns(userId, since);
    const cpc = await reporter.getData(
      userId,
      [
        {
          display: "metric",
          id: "cpc",
          source: "meta-ads",
        },
        {
          display: "metric",
          id: "cpc",
          source: "google-ads",
        },
      ],
      since
    );

    const result = await gemini.getFlashTextResponse(
      prompt +
        "Given data:" +
        "Google Ads campaigns:" +
        JSON.stringify(googleCampaigns) +
        "Meta Ads campaigns:" +
        JSON.stringify(metaCampaigns) +
        "cpc values:" +
        JSON.stringify(cpc)
    );

    console.log(googleCampaigns, null, 2);
    console.log(metaCampaigns, null, 2);
    console.log(cpc, null, 2);

    res.send(result);
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
