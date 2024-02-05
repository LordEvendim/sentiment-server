import { Request, Response } from "express";

import { LoginResponse, PostLoginDetails, PostRegister } from "#types/auth";

import { handleControllerError } from "#utils/errorHandling";
import { TypedRequest } from "#types/express";
import { AuthProvider } from "#modules/auth/types";
import { usernameAuth } from "#modules/auth";
import { metaAuth } from "#modules/meta/metaAuth";
import { logger } from "#modules/logger";

const createAuthController = (auth: AuthProvider) => {
  return {
    getSession: (req: Request, res: Response) => {
      try {
        const userSession = req.session.user;

        if (!userSession) return res.status(404).send({});

        return res.status(200).send(userSession);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    login: async (
      req: TypedRequest<PostLoginDetails>,
      res: Response<LoginResponse>
    ) => {
      try {
        const { password, username } = req.body;

        if (!password || !username) throw new Error("Invalid login details");

        const userInfo = await auth.login(username, password);

        if (!userInfo) {
          return res.status(401).send({});
        }

        // save user details to session
        req.session.user = userInfo;

        await new Promise((resolve) => {
          req.session.save(() => resolve(true));
        });

        return res.status(200).send(userInfo);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    register: async (
      req: TypedRequest<PostRegister>,
      res: Response<string>
    ) => {
      try {
        const { password, username, name } = req.body;

        if (!password || !username || !name)
          throw new Error("Invalid register details");

        const userDetails = await auth.register(username, name, password);

        return res.status(200).send(userDetails);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    logout: (req: Request, res: Response) => {
      try {
        req.session.user = undefined;

        return res.status(200).clearCookie("sessionId").send();
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getLongLivedAccessToken: async (
      req: TypedRequest<{}, {}, { accessToken: string; userId: string }>,
      res: Response
    ) => {
      try {
        const token = req.query.accessToken;
        const userId = req.query.userId;

        if (!token || !userId) throw new Error("Invalid request");

        const longLivedToken = await metaAuth.getLongLivedToken(userId, token);

        console.log("getting long lived token");
        await metaAuth.getLongLivedPageTokens(userId);

        return res.status(200).send(longLivedToken);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const authController = createAuthController(usernameAuth);
