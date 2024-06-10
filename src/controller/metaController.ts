import { subDays, subYears } from "date-fns";
import { Response } from "express";

import { metaIntegrationDao } from "#dao/metaIntegrationDao";
import {
  MetaAdAccountDetails,
  MetaIntegration,
  MetaPageDetails,
} from "#db/schema";
import { MetaInsights, metaInsights } from "#modules/meta";
import { metaAds } from "#modules/meta/metaAds";
import { metaAuth } from "#modules/meta/metaAuth";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createMetaController = (metaInsights: MetaInsights) => {
  return {
    getTopCampaigns: async (
      req: TypedRequest<object, object, { since: string }>,
      res: Response
    ) => {
      try {
        const userId = req.session.user?.id;

        if (!userId) throw new Error("Invlid request");
        if (!req.query.since) throw new Error("Timeframe not specified");

        const since =
          parseInt(req.query.since) ?? subDays(Date.now(), 7 + 1).getTime();

        if (since < subYears(Date.now(), 2).getTime())
          throw new Error("Timeframe out of range");

        const data = await metaAds.getTopCampaigns(userId, new Date(since));

        return res.status(200).send(data);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getUserPages: async (
      req: TypedRequest<object, object, object>,
      res: Response<{
        pages:
          | {
              name: string;
              id: number;
            }[]
          | undefined;
        adAccounts: MetaAdAccountDetails[] | undefined;
        selectedPage: number | undefined;
        selectedAdAccount: number | undefined;
      }>
    ) => {
      try {
        const userId = req.session.user?.id;

        if (!userId) throw new Error("Invlid request");

        const userPages = await metaInsights.getUserPages(userId);
        const userAdAccounts = await metaInsights.getUserAdAccounts(userId);

        const metaIntegration =
          await metaIntegrationDao.getIntegrationByUserId(userId);

        return res.status(200).send({
          pages: userPages,
          adAccounts: userAdAccounts,
          selectedPage: metaIntegration?.selectedPage ?? undefined,
          selectedAdAccount: metaIntegration?.selectedAdAccount ?? undefined,
        });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    selectPage: async (
      req: TypedRequest<{ pageId: number }>,
      res: Response<{ selectedPage: number }>
    ) => {
      try {
        const { pageId } = req.body;
        const userId = req.session.user?.id;

        if (!userId || !pageId) throw new Error("Invlid request");

        const result = await metaInsights.selectPage(userId, pageId);

        return res.status(200).send({ selectedPage: result });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    selectAdAccount: async (
      req: TypedRequest<{ adAccountId: number }>,
      res: Response<{ selectedAdAccount: number }>
    ) => {
      try {
        const { adAccountId } = req.body;
        const userId = req.session.user?.id;

        if (!userId || !adAccountId) throw new Error("Invlid request");

        const result = await metaInsights.selectAdAccount(userId, adAccountId);

        return res.status(200).send({ selectedAdAccount: result });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getUserIntegration: async (
      req: TypedRequest<object, object, object>,
      res: Response<
        | (Omit<MetaIntegration, "selectedPage" | "selectedAdAccount"> & {
            selectedPage?: MetaPageDetails;
            selectedAdAccount?: MetaAdAccountDetails;
          })
        | undefined
      >
    ) => {
      try {
        const userId = req.session.user?.id;

        if (!userId) throw new Error("Invlid request");

        const result = await metaInsights.getUserIntegration(userId);

        return res.status(200).send(result);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    createAccessToken: async (
      req: TypedRequest<
        { accessToken: string; metaId: string },
        object,
        object
      >,
      res: Response
    ) => {
      try {
        const token = req.body.accessToken;
        const metaId = req.body.metaId;
        const userId = req.session.user?.id;

        if (!token || !metaId || !userId) throw new Error("Invalid request");

        const longLivedToken = await metaAuth.createAccessToken(
          userId,
          metaId,
          token
        );

        return res.status(200).send(longLivedToken);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const metaController = createMetaController(metaInsights);
