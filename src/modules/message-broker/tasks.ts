import { ConsumeMessage } from "amqplib";

import { metaInsights } from "#modules/meta";
import { metaAds } from "#modules/meta/metaAds";
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
  fetch: async (message) => {
    const data = JSON.parse(message.content.toString()) as FetchTask;

    await metaAds.pullLastDayData(data.userId);
    await metaInsights.pullLastDayData(data.userId);

    await wait(1);
  },
};
