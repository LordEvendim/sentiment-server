import { logger } from "#modules/logger";

class Scheduler {
  start = () => {
    logger.debug("Scheduler: scheduler started");
  };
}

export const scheduler = new Scheduler();
