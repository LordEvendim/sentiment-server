import amqp from "amqplib";

import { logger } from "#modules/logger";

import { QueueNames, queuesConfig } from "./queues";
import { tasks } from "./tasks";

class QueueConsumer {
  async start() {
    try {
      const connection = await amqp.connect(
        process.env.NODE_ENV === "dev"
          ? `amqp://${process.env.RABBITMQ_DEV_HOST ?? "localhost"}:5672`
          : process.env.RABBITMQ_URL!
      );
      logger.info("Message Broker: consumer connected with RabbitMQ");

      const channel = await connection.createChannel();

      process.once("SIGINT", async () => {
        await channel.close();
        await connection.close();
      });

      for (const queueName in queuesConfig) {
        logger.debug(
          "Message Broker: setting up consumer for queue: " + queueName
        );
        await channel.assertQueue(
          queueName as QueueNames,
          queuesConfig[queueName as QueueNames].queue
        );

        await channel.prefetch(1);
        await channel.consume(
          queueName as QueueNames,
          async (message) => {
            if (!message) {
              logger.warn("Message Broker: no message content");
              return;
            }

            try {
              await tasks[queueName as QueueNames](message);

              channel.ack(message);
            } catch (error: unknown) {
              channel.nack(message, undefined, false);
            }
          },
          queuesConfig[queueName as QueueNames].consume
        );
      }
    } catch (err) {
      console.warn(err);
    }
  }
}

export const queueConsumer = new QueueConsumer();
