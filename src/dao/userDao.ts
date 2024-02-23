import { eq } from "drizzle-orm";
import { planetScaleDB } from "src/db/planetscale";

import { NewUser, User, users } from "#db/schema/users";

const createUserDao = () => {
  return {
    getById: async (id: number): Promise<User | undefined> => {
      const result: User[] = await planetScaleDB
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return result.length > 0 ? result[0] : undefined;
    },
    getByUsername: async (username: string): Promise<User | undefined> => {
      const result: User[] = await planetScaleDB
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      return result.length > 0 ? result[0] : undefined;
    },
    create: async (newUser: NewUser) => {
      const result = await planetScaleDB.insert(users).values(newUser);

      return result;
    },
  };
};

export const userDao = createUserDao();
export type UserDao = typeof userDao;
