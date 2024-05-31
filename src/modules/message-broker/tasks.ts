import { ConsumeMessage } from "amqplib";

import { googleAnalytics } from "#modules/google";
import { logger } from "#modules/logger";
import { metaInsights } from "#modules/meta";
import { metaAds } from "#modules/meta/metaAds";
import { generativeReporter } from "#modules/reporter";
import { wait } from "#utils/wait";

import { QueueNames } from "./queues";

export type ReportPeriods = "weekly" | "monthly";

export type TaskData = object;

export interface ReportTask extends TaskData {
  userId: number;
  period: ReportPeriods;
}

export interface FetchTask extends TaskData {
  userId: number;
}

export interface InitialPullTask extends TaskData {
  userId: number;
}

export const tasks: Record<
  QueueNames,
  (message: ConsumeMessage) => Promise<void>
> = {
  report: async (message) => {
    const data = JSON.parse(message.content.toString()) as ReportTask;

    await generativeReporter.generateWeeklyReport(data.userId);
  },
  pull: async (message) => {
    const data = JSON.parse(message.content.toString()) as FetchTask;
    logger.debug("Queue Consumer: pulling data for user " + data.userId);

    try {
      await metaAds.pullLastDayData(data.userId);
    } catch (error) {
      logger.error("Cron pull: Meta Ads of:" + data.userId);
      logger.error(error);
    }

    try {
      await metaInsights.pullLastDayData(data.userId);
    } catch (error) {
      logger.error("Cron pull: Meta Insights of:" + data.userId);
      logger.error(error);
    }

    try {
      await googleAnalytics.pullLastDayData(data.userId);
    } catch (error) {
      logger.error("Cron pull: Google Analytics of: " + data.userId);
      logger.error(error);
    }

    // await googleAds.pullLastDayData(data.userId);

    await wait(1);
  },
  test: async () => {
    console.log("test message");
    await wait(0.1);
    throw new Error("test error");
  },
};
