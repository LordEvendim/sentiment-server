import { eq } from "drizzle-orm";

import { mysqlDatabase } from "#db/mysql";
import { NewUser, User, users } from "#db/schema/users";

export const userDao = {
  getAll: async (): Promise<User[] | undefined> => {
    const result = await mysqlDatabase.query.users.findMany();

    return result;
  },
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
  update: async (id: number, update: Partial<NewUser>) => {
    await mysqlDatabase.update(users).set(update).where(eq(users.id, id));
  },
  create: async (newUser: NewUser) => {
    const result = await mysqlDatabase.insert(users).values(newUser);

    return result;
  },
};

export type UserDao = typeof userDao;
