import { CronJob } from "cron";

import { logger } from "#modules/logger";

import { jobs } from "./jobs";

class Scheduler {
  jobs: CronJob[] = [];

  start = () => {
    logger.debug("Scheduler: scheduler started");

    this.jobs = [
      new CronJob(
        "0 3 * * *",
        jobs.fetchDailyDataJob,
        null,
        true,
        "America/New_York"
      ),
      new CronJob(
        "0 15 * * *",
        jobs.fetchDailyDataJob,
        null,
        true,
        "America/New_York"
      ),
      new CronJob(
        "0 0 * * *",
        jobs.clearGeminiLimitJob,
        null,
        true,
        "America/New_York"
      ),
      new CronJob(
        "0 0 * * *",
        jobs.resetCreditsJob,
        null,
        true,
        "America/New_York"
      ),
    ];
  };
}

export const scheduler = new Scheduler();
