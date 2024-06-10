import { userDao } from "#dao/userDao";
import { redisConnection } from "#db/redis";
import { USED_TOKENS_KEY } from "#modules/gemini";
import { logger } from "#modules/logger";
import { queueProducer } from "#modules/message-broker";

export const jobs = {
  fetchDailyDataJob: async () => {
    logger.debug(`Scheduler: pull daily data`);

    const users = await userDao.getAll();

    if (!users || users.length === 0) {
      logger.debug("Scheduler: pull job: canceling task: no users");
      return;
    }

    for (let i = 0; i < users.length; i++) {
      logger.debug("Scheduler: sending pull job for user " + users[i].id);
      await queueProducer.sendMessage("pull", { userId: users[i].id });
    }
  },
  clearGeminiLimitJob: async () => {
    try {
      logger.debug("Scheduler: reseting Gemini token tracker");

      await redisConnection.connection.set(USED_TOKENS_KEY, 0);
    } catch (error: unknown) {
      logger.error("Scheduler: failed to reset Gemini token tracker");
      logger.error(error);

      if (error instanceof Error) logger.error(error.stack);
    }
  },
  resetCreditsJob: async () => {
    try {
      logger.debug("Scheduler: reseting credits");

      const users = await userDao.getAll();
      if (!users || users.length === 0) {
        logger.debug("Scheduler: pull job: canceling task: no users");
        return;
      }

      for (let i = 0; i < users.length; i++) {
        logger.debug("Scheduler: reseting credits for user " + users[i].id);
        await userDao.update(users[i].id, {
          credits: 10,
        });
      }

      await redisConnection.connection.set(USED_TOKENS_KEY, 0);
    } catch (error: unknown) {
      logger.error("Scheduler: failed to reset credits");
      logger.error(error);

      if (error instanceof Error) logger.error(error.stack);
    }
  },
};
