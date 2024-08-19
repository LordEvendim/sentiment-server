import { redisConnection } from "#db/redis";
import { User } from "#db/schema";

export const sessionTokenDao = {
  updateSessionsByUsername: async (user: User) => {
    const userSessions = await redisConnection.connection.keys(
      `session:${user.username}-*`
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, credits, ...userSessionData } = user;

    for (let i = 0; i < userSessions.length; i++) {
      const session = await redisConnection.connection.get(userSessions[i]);

      if (!session) continue;

      const sessionData = JSON.parse(session) as { user: object };
      sessionData.user = userSessionData;

      await redisConnection.connection.set(
        userSessions[i],
        JSON.stringify(sessionData)
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
