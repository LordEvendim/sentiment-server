import { compare, hash } from "bcrypt";
import { nanoid } from "nanoid";

import { SALTING_ROUNDS } from "#config/crypto";
import { userDao } from "#dao/userDao";
import { logger } from "#modules/logger";
import { UserInfo } from "#types/user";

import { AuthProvider } from "./types";

export class Auth implements AuthProvider {
  constructor() {
    logger.debug("Auth class initialized");
  }

  login = async (
    username: string,
    password: string
  ): Promise<UserInfo | undefined> => {
    const user = await userDao.getByUsername(username);

    if (!user) throw new Error("User doesn't exist");

    const isMatchingPassword = await compare(password, user.password);

    if (!isMatchingPassword) throw new Error("Invalid password");

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
    };
  };

  register = async (
    username: string,
    fullName: string,
    password: string,
    email: string
  ) => {
    const user = await userDao.getByUsername(username);
    if (user) throw new Error("Username is taken");

    const hashedPassword = await hash(password, SALTING_ROUNDS);
    const newUserId = nanoid();

    await userDao.create({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    return newUserId;
  };
}

export const usernameAuth = new Auth();
