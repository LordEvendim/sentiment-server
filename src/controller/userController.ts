import { Response } from "express";

import { userDao } from "#dao/userDao";
import { TypedRequest } from "#types/express";
import { UserInfo } from "#types/user";
import { handleControllerError } from "#utils/errorHandling";

const createUserController = () => {
  return {
    getUserInfo: async (
      req: TypedRequest<object, { id: number }>,
      res: Response<UserInfo>
    ) => {
      try {
        const { id } = req.params;

        if (!id) throw new Error("Id is required");

        const user = await userDao.getById(id);

        return res.status(200).send(user);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
    getUserCredits: async (
      req: TypedRequest,
      res: Response<{ value: number | undefined }>
    ) => {
      try {
        const userSession = req.session.user;

        if (!userSession) return res.status(404).send();

        const user = await userDao.getById(userSession.id);

        return res.status(200).send({ value: user?.credits });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const userController = createUserController();
