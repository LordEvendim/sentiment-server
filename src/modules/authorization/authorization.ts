import { userDao, UserDao } from "#dao/userDao";
import { Authorization } from "./types";

import { Roles } from "#types/user";

class AuthorizationModule implements Authorization {
  private userDao: UserDao;

  constructor(userDao: UserDao) {
    this.userDao = userDao;
  }

  async isAdmin(userId: string) {
    const user = await this.userDao.findOne({ id: userId });

    if (!user) throw new Error("User doesn't exist");

    return user.role === Roles.Admin;
  }
}

export const authorization = new AuthorizationModule(userDao);
