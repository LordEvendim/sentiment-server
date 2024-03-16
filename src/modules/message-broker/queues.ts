import { Options } from "amqplib";

export type Queues = "report";

export const queuesConfig: Record<
  Queues,
  {
    queue: Options.AssertQueue;
    consume: Options.Consume;
    queueSend: Options.Publish;
  }
> = {
  report: {
    queue: {
      durable: true,
    },
    queueSend: {
      persistent: true,
    },
    consume: {
      noAck: false,
    },
  },
};

export type ReportPeriods = "weekly" | "monthly";
