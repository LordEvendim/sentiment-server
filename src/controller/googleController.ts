import { Response } from "express";

import { googleAnalytics, googleAuth } from "#modules/google";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createGoogleController = () => {
  return {
    getUserIntegration: async (
      req: TypedRequest<object, object, object>,
      res: Response
    ) => {
      try {
        const userId = req.session.user?.id;

        if (!userId) throw new Error("Invalid request");

        const integration = await googleAnalytics.getUserIntegraiton(userId);

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
      req: TypedRequest<
        {
          code: string;
        },
        object,
        object
      >,
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
  };
};

export const googleController = createGoogleController();
