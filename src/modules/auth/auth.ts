import { compare, hash } from "bcrypt";
import { nanoid } from "nanoid";

import { SALTING_ROUNDS } from "#config/crypto";
import { userDao } from "#dao/userDao";
import { logger } from "#modules/logger";
import { UserSession } from "#types/user";

import { AuthProvider } from "./types";

export class Auth implements AuthProvider {
  login = async (
    username: string,
    password: string
  ): Promise<UserSession | undefined> => {
    const user = await userDao.getByUsername(username);
    if (!user) throw new Error("Auth: user doesn't exist");

    const isMatchingPassword = await compare(password, user.password);
    if (!isMatchingPassword) throw new Error("Auth: invalid password");

    logger.debug(`Auth: user logged in ${username}`);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
    };
  };
  register = async (
    username: string,
    fullName: string,
    password: string,
    email: string
  ) => {
    const user = await userDao.getByUsername(username);
    if (user) throw new Error("Auth: username is taken");

    const hashedPassword = await hash(password, SALTING_ROUNDS);
    const newUserId = nanoid();

    logger.debug(`Auth: user registered ${username}`);

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
