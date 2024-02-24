import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { NewUser, User, users } from "#db/schema/users";

const userDao = {
  getById: async (id: number): Promise<User | undefined> => {
    const result = await planetScaleDB.query.users.findFirst({
      where: eq(users.id, id),
    });

    return result;
  },
  getByUsername: async (username: string): Promise<User | undefined> => {
    const result = await planetScaleDB.query.users.findFirst({
      where: eq(users.username, username),
    });

    return result;
  },
  create: async (newUser: NewUser) => {
    const result = await planetScaleDB.insert(users).values(newUser);

    return result;
  },
};

export type UserDao = typeof userDao;
