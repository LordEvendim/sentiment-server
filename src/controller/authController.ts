import { Request, Response } from "express";

import { usernameAuth } from "#modules/auth";
import { AuthProvider } from "#modules/auth/types";
import { LoginResponse, PostLoginDetails } from "#types/auth";
import { TypedRequest } from "#types/express";
import { handleControllerError } from "#utils/errorHandling";

const createAuthController = (auth: AuthProvider) => {
  return {
    getSession: (req: Request, res: Response) => {
      try {
        const userSession = req.session.user;

        if (!userSession) return res.status(404).send();

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

        if (!userInfo) return res.status(401).send();

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
      req: TypedRequest<{
        username: string;
        name: string;
        password: string;
        email: string;
      }>,
      res: Response<string>
    ) => {
      try {
        const { password, username, name, email } = req.body;

        if (!password || !username || !name || !email)
          throw new Error("Invalid register details");

        const userDetails = await auth.register(
          username,
          name,
          password,
          email
        );

        return res.status(200).send(userDetails);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    logout: async (req: Request, res: Response) => {
      try {
        await new Promise<void>((resolve, reject) => {
          req.session.destroy((err) => {
            if (err) return reject();
            resolve();
          });
        });

        return res.status(200).clearCookie("sessionId").send();
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const authController = createAuthController(usernameAuth);
