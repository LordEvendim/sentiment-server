import { ConsumeMessage } from "amqplib";

import { logger } from "#modules/logger";
import { generativeReporter } from "#modules/reporter";
import { wait } from "#utils/wait";

import { QueueNames, ReportPeriods } from "./queues";

export type TaskData = {
  retry: number;
};

export interface ReportTask extends TaskData {
  userId: number;
  period: ReportPeriods;
}

export interface FetchTask extends TaskData {
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

    // await metaAds.pullLastDayData(data.userId);
    // await metaInsights.pullLastDayData(data.userId);
    // await googleAnalytics.pullLastDayData(data.userId);

    await wait(1);
  },
};
