import { Response } from "express";

import { googleIntegrationDao } from "#dao/googleIntegrationDao";
import { GoogleAnalytics, googleAnalytics, googleAuth } from "#modules/google";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createGoogleController = (googleAnalytics: GoogleAnalytics) => {
  return {
    getUserPages: async (
      req: TypedRequest<object, object, object>,
      res: Response<{
        analyticsAccounts:
          | {
              name: string;
              id: number;
            }[]
          | undefined;
        selectedAnalyticsAccount: number | undefined;
      }>
    ) => {
      try {
        const userId = req.session.user?.id;

        if (!userId) throw new Error("Invlid request");

        const result = await googleAnalytics.getUserAccounts(userId);
        const selectedPage =
          await googleIntegrationDao.getIntegrationByUserId(userId);

        return res.status(200).send({
          analyticsAccounts: result,
          selectedAnalyticsAccount: selectedPage?.selectedPage ?? undefined,
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
        const url = googleAuth.getAuthorizationUrl();

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

        const accessToken = await googleAuth.createAccessToken(code, userId);

        return res.status(200).send(accessToken);
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
  };
};

export const googleController = createGoogleController(googleAnalytics);
