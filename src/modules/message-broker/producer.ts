import amqp from "amqplib";

import { logger } from "#modules/logger";

import { QueueNames, Queues, queuesConfig } from "./queues";

class QueueProducer {
  isStarting: boolean = false;
  channel: amqp.Channel | undefined;
  connection: amqp.Connection | undefined;

  async start() {
    if (this.isStarting) return;

    process.once("SIGINT", async () => {
      logger.warn("Message Producer: SIGINT");

      await this.channel?.close();
      await this.connection?.close();
    });

    try {
      this.isStarting = true;
      this.connection = await amqp.connect(
        process.env.NODE_ENV === "dev"
          ? `amqp://${process.env.RABBITMQ_DEV_HOST ?? "localhost"}:5672`
          : process.env.RABBITMQ_URL!
      );
      logger.info("Message Broker: producer connected with RabbitMQ");

      this.connection.on("error", (...e) =>
        logger.error(
          "Queue Producer: connection error",
          new Error(JSON.stringify(e))
        )
      );

      this.channel = await this.connection.createChannel();
      this.channel.addListener("error", (...e) =>
        logger.error(
          "Queue Producer: channel error",
          new Error(JSON.stringify(e))
        )
      );
      this.channel.addListener("close", (...e) => {
        logger.error(
          "Queue Producer: channel closed",
          new Error(JSON.stringify(e))
        );
        this.channel = undefined;
      });

      await this.channel.prefetch(1);
    } catch (e) {
      logger.error("Queue Producer: error", e);
    }

    this.isStarting = false;
  }

  async sendMessage<T extends QueueNames>(queueName: T, message: Queues[T]) {
    try {
      if (!this.channel || !this.connection) {
        this.start();
        throw new Error(
          "Queue Producer: connection with message broker is not established"
        );
      }

      logger.debug(`Message Broker: sending message to ${queueName}`);
      await this.channel.assertQueue(queueName, queuesConfig[queueName].queue);
      this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)),
        queuesConfig[queueName].queueSend
      );
    } catch (e) {
      logger.error("Queue Producer: error", e);
    }
  }
}

export const queueProducer = new QueueProducer();
