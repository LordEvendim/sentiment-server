import { Options } from "amqplib";

export type Queues = {
  report: {
    userId: number;
  };
  fetch: {
    userId: number;
  };
};

export type QueueNames = keyof Queues;

export const queuesConfig: Record<
  QueueNames,
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
  fetch: {
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
