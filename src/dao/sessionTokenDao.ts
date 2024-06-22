import { redisConnection } from "#db/redis";
import { User } from "#db/schema";

export const sessionTokenDao = {
  updateSessionsByUsername: async (username: string, user: User) => {
    const userSessions = await redisConnection.connection.keys(
      `session:${user.username}-*`
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, credits, ...userSession } = user;

    for (let i = 0; i < userSessions.length; i++) {
      await redisConnection.connection.set(
        userSessions[i],
        JSON.stringify(userSession)
      );
    }
  },
  deleteSessionsByUsername: async (username: string) => {
    const userSessions = await redisConnection.connection.keys(
      `session:${username}-*`
    );
    await redisConnection.connection.del(userSessions);
  },
};

export type SessionTokenDao = typeof sessionTokenDao;
