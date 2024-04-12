import { eq } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { NewUser, User, users } from "#db/schema/users";

export const userDao = {
  getById: async (id: number): Promise<User | undefined> => {
    const result = await mysqlDatabase.query.users.findFirst({
      where: eq(users.id, id),
    });

    return result;
  },
  getByUsername: async (username: string): Promise<User | undefined> => {
    const result = await mysqlDatabase.query.users.findFirst({
      where: eq(users.username, username),
    });

    return result;
  },
  create: async (newUser: NewUser) => {
    const result = await mysqlDatabase.insert(users).values(newUser);

    return result;
  },
};

export type UserDao = typeof userDao;
