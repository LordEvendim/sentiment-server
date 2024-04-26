import { CronJob } from "cron";

import { userDao } from "#dao/userDao";
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

    this.jobs.push(fetchDataJob);
  };
}

export const scheduler = new Scheduler();
