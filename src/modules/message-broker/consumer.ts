import amqp from "amqplib";

import { logger } from "#modules/logger";

import { Queues, queuesConfig } from "./queues";
import { TaskData, tasks } from "./tasks";

class QueueConsumer {
  shouldReject = true;
  retriesLimit = 5;

  async start() {
    try {
      const connection = await amqp.connect("amqp://localhost:5672");
      const channel = await connection.createChannel();

      process.once("SIGINT", async () => {
        await channel.close();
        await connection.close();
      });

      let queueName: Queues;

      for (queueName in queuesConfig) {
        logger.debug(
          "Message Broker: setting up consumer for queue: " + queueName
        );
        await channel.assertQueue(queueName, queuesConfig[queueName].queue);
        await channel.consume(
          queueName,
          async (message) => {
            if (!message) return;
            const data = JSON.parse(message.content.toString()) as TaskData;

            await tasks[queueName](message);

            try {
              channel.ack(message);
            } catch (error: unknown) {
              data.retry < this.retriesLimit
                ? channel.nack(message, undefined, true)
                : channel.ack(message);
            }
          },
          queuesConfig[queueName].consume
        );
      }
    } catch (err) {
      console.warn(err);
    }
  }
}

export const queueConsumer = new QueueConsumer();
