import amqp from "amqplib";

import { logger } from "#modules/logger";

import { QueueNames, queuesConfig } from "./queues";
import { tasks } from "./tasks";

class QueueConsumer {
  async start() {
    try {
      const connection = await amqp.connect(
        process.env.NODE_ENV === "prod"
          ? process.env.RABBITMQ_URL!
          : "amqp://localhost:5672"
      );
      logger.info("Message Broker: consumer connected with RabbitMQ");

      const channel = await connection.createChannel();

      process.once("SIGINT", async () => {
        await channel.close();
        await connection.close();
      });

      let queueName: QueueNames;

      for (queueName in queuesConfig) {
        logger.debug(
          "Message Broker: setting up consumer for queue: " + queueName
        );
        await channel.assertQueue(queueName, queuesConfig[queueName].queue);

        await channel.prefetch(1);
        await channel.consume(
          queueName,
          async (message) => {
            if (!message) return;
            // const data = JSON.parse(message.content.toString()) as TaskData;

            try {
              await tasks[queueName](message);

              channel.ack(message);
            } catch (error: unknown) {
              channel.nack(message, undefined, false);
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
