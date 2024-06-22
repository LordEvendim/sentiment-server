import { Response } from "express";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { GoogleAnalytics, googleAnalytics, googleAuth } from "#modules/google";
import { googleAds } from "#modules/google/googleAds";
import GoogleAuthLab from "#modules/google/googleAuthLab";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createGoogleController = (googleAnalytics: GoogleAnalytics) => {
  return {
    getUserPages: async (
      req: TypedRequest<object, object, object>,
      res: Response<{
        analyticsAccounts: {
          id: number;
          name: string;
          parentAccountName: string;
        }[];
        adAccounts: {
          id: number;
        }[];
        selectedAnalyticsAccount: number | undefined;
        selectedAdAccount: number | undefined;
      }>
    ) => {
      try {
        const userId = req.session.user?.id;

        if (!userId) throw new Error("Invlid request");

        const analyticsAccounts = await googleAnalytics.getUserAccounts(userId);
        const adAccounts = await googleAds.getUserAccounts(userId);
        const integration =
          await googleIntegrationDao.getIntegrationByUserId(userId);

        return res.status(200).send({
          analyticsAccounts: analyticsAccounts ?? [],
          adAccounts: adAccounts ?? [],
          selectedAnalyticsAccount: integration?.selectedPage ?? undefined,
          selectedAdAccount: integration?.selectedAdAccount ?? undefined,
        });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getUserIntegration: async (
      req: TypedRequest<object, object, object>,
      res: Response
    ) => {
      try {
        const userId = req.session.user?.id;

        if (!userId) throw new Error("Invalid request");

        const integration =
          await googleIntegrationDao.getIntegrationWithSelectedByUserId(userId);

        return res.status(200).send(integration);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getAuthorizationUrl: async (
      req: TypedRequest<object, object, object>,
      res: Response
    ) => {
      try {
        const url = await GoogleAuthLab.getAuthorizedUrl();

        return res.status(200).send(url);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    createAccessToken: async (
      req: TypedRequest<{
        code: string;
      }>,
      res: Response
    ) => {
      try {
        const code = req.body.code;
        const userId = req.session.user!.id;

        if (!code) throw new Error("Code is not defined");

        const googleAuth = new GoogleAuthLab(userId);

        const tokens = await googleAuth.generateOAuthTokens(code);

        const access = tokens.access_token;

        if (access) {
          await googleAnalytics.connectUserAccounts(userId);
          await googleAds.connectUserAccounts(userId);
        }

        return res.status(200).send(access);
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

        const result = await googleAnalytics.selectPage(userId, pageId);

        return res.status(200).send({ selectedPage: result });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    selectAdAccount: async (
      req: TypedRequest<{ accountId: number }>,
      res: Response<{ selectedAccount: number }>
    ) => {
      try {
        const { accountId } = req.body;
        const userId = req.session.user?.id;

        if (!userId || !accountId) throw new Error("Invlid request");

        const result = await googleAds.selectAccount(userId, accountId);

        return res.status(200).send({ selectedAccount: result });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    logout: async (req: TypedRequest, res: Response) => {
      try {
        const userId = req.session.user?.id;

        if (!userId) throw new Error("Invlid request");

        await googleAuth.revoke(userId);

        return res.status(200).send({ message: "OK" });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const googleController = createGoogleController(googleAnalytics);
