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

        if (!id) throw new Error("Username is required");

        const user = await userDao.getById(id);

        return res.status(200).send(user);
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const userController = createUserController();
