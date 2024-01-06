import { Request, Response } from "express";
import { z } from "zod";

import { handleControllerError } from "#utils/errorHandling";
import { Roles, UserInfo } from "#types/user";

const userIdSchema = z.string();

const createUserController = () => {
  return {
    getUserInfo: async (req: Request, res: Response<{ user: UserInfo }>) => {
      try {
        throw new Error("Contoller logic not implemented");

        return res.status(200).send({
          user: {
            id: "123",
            username: "Name",
            name: "John",
            role: Roles.User,
          },
        });
      } catch (error) {
        return handleControllerError(res, error);
      }
    },
  };
};

export const userController = createUserController();
