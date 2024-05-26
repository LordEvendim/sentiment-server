import { CronJob } from "cron";

import { userDao } from "#dao/userDao";
import { redisConnection } from "#db/redis";
import { USED_TOKENS_KEY } from "#modules/gemini";
import { logger } from "#modules/logger";
import { queueProducer } from "#modules/message-broker";

class Scheduler {
  jobs: CronJob[] = [];

  start = () => {
    logger.debug("Scheduler: scheduler started");
    const fetchDataJob = new CronJob(
      "10 */12 * * *", // https://crontab.cronhub.io/
      async function () {
        logger.debug(`Scheduler: running cron job: pull daily data`);

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
      null, // onComplete
      true, // start
      "America/New_York" // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    );

    const clearGeminiLimitJob = new CronJob(
      "0 0 * * *",
      async function () {
        try {
          logger.debug("Scheduler: reseting Gemini token tracker");

          await redisConnection.connection.set(USED_TOKENS_KEY, 0);
        } catch (error: unknown) {
          logger.error("Scheduler: failed to reset Gemini token tracker");
          logger.error(error);

          if (error instanceof Error) logger.error(error.stack);
        }
      },
      null, // onComplete
      true, // start
      "America/New_York"
    );

    const resetCreditsJob = new CronJob(
      "0 0 * * *",
      async function () {
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
      null, // onComplete
      true, // start
      "America/New_York"
    );

    this.jobs.push(fetchDataJob, clearGeminiLimitJob, resetCreditsJob);
  };
}

export const scheduler = new Scheduler();
