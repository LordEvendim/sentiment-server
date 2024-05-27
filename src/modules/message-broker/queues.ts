import { Options } from "amqplib";

export type Queues = {
  report: {
    userId: number;
  };
  pull: {
    userId: number;
  };
  test: {};
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
  pull: {
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
  test: {
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
