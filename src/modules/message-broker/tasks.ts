import { ConsumeMessage } from "amqplib";
import { format, subDays } from "date-fns";

import { googleAnalytics } from "#modules/google";
import { googleAds } from "#modules/google/googleAds";
import { logger } from "#modules/logger";
import { metaInsights } from "#modules/meta";
import { metaAds } from "#modules/meta/metaAds";
import { generativeReporter } from "#modules/reporter";
import { calculateTimeframeStart } from "#modules/reporter/timeframes";
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
    try {
      const data = JSON.parse(message.content.toString()) as ReportTask;
      const until = subDays(new Date(Date.now()), 1);

      await generativeReporter.generateReport(
        data.userId,
        "last-7-days",
        format(
          calculateTimeframeStart(new Date(Date.now()), "last-7-days"),
          "yyyyMMdd"
        ),
        format(until, "yyyyMMdd")
      );
    } catch (e) {
      logger.error(e);
    }
  },
  pull: async (message) => {
    try {
      const data = JSON.parse(message.content.toString()) as FetchTask;
      logger.debug("Queue Consumer: pulling data for user " + data.userId);

      try {
        await metaAds.pullLastDayData(data.userId);
      } catch (error) {
        logger.error("Cron pull: Meta Ads of:" + data.userId, error);
      }

      try {
        await metaInsights.pullLastDayData(data.userId);
      } catch (error) {
        logger.error("Cron pull: Meta Insights of:" + data.userId, error);
      }

      try {
        await googleAnalytics.pullLastDayData(data.userId);
      } catch (error) {
        logger.error("Cron pull: Google Analytics of: " + data.userId, error);
      }

      try {
        await googleAds.pullLastDayData(data.userId);
      } catch (error) {
        logger.error("Cron pull: Google Ads of: " + data.userId, error);
      }

      await wait(1);
    } catch (e) {
      logger.error(
        `Queue Consumer: pull task failed. Message: ${message.content.toString()}`,
        e
      );
    }
  },
  test: async () => {
    logger.info("Queue Consumer: test message");
    await wait(0.1);
    throw new Error("Queue Consumer: test error");
  },
};
