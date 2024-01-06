import { compare, hash } from "bcrypt";
import { nanoid } from "nanoid";

import { Roles, User, UserInfo } from "#types/user";

import { userDao } from "#dao/userDao";
import { logger } from "#modules/logger";
import { SALTING_ROUNDS } from "#config/crypto";

import { AuthProvider } from "./types";

export class Auth implements AuthProvider {
  constructor() {
    logger.debug("Auth class initialized");
  }

  login = async (
    username: string,
    password: string
  ): Promise<UserInfo | undefined> => {
    const user: User | null = await userDao.findOne({ username });

    if (!user?.password) {
      logger.debug("Failed login attempt, user doesn't exist");
      return undefined;
    }

    const isMatchingPassword = await compare(password, user.password);

    if (!isMatchingPassword) return undefined;

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };
  };

  register = async (username: string, name: string, password: string) => {
    const user = await userDao.findOne({ username });
    if (user) throw new Error("User already exists");

    const hashedPassword = await hash(password, SALTING_ROUNDS);
    const newUserId = nanoid();

    await userDao.create({
      id: newUserId,
      username,
      name,
      password: hashedPassword,
      role: Roles.User,
    });

    return newUserId;
  };
}

export const usernameAuth = new Auth();
