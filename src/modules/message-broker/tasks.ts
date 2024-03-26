import { ConsumeMessage } from "amqplib";

import { generativeReporter } from "#modules/reporter";

import { Queues, ReportPeriods } from "./queues";

export type TaskData = {
  retry: number;
};

export interface TaskReport extends TaskData {
  userId: number;
  period: ReportPeriods;
}

export const tasks: Record<Queues, (message: ConsumeMessage) => Promise<void>> =
  {
    report: async (message) => {
      const data = JSON.parse(message.content.toString()) as TaskReport;

      await generativeReporter.generateWeeklyReport(data.userId);
    },
  };
