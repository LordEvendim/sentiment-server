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
      await this.channel?.close();
      await this.connection?.close();
    });

    try {
      this.isStarting = true;
      this.connection = await amqp.connect(
        process.env.NODE_ENV === "prod"
          ? process.env.RABBITMQ_URL!
          : `amqp://${process.env.RABBITMQ_DEV_HOST ?? "localhost"}:5672`
      );
      logger.info("Message Broker: producer connected with RabbitMQ");

      this.channel = await this.connection.createChannel();
      this.channel.prefetch(1);
    } finally {
      this.isStarting = false;
    }
  }

  async sendMessage<T extends QueueNames>(queueName: T, message: Queues[T]) {
    try {
      if (!this.channel || !this.connection) {
        this.start();
        throw new Error("Connection with message broker is not established");
      }

      logger.debug(`Message Broker: sending message to ${queueName}`);
      await this.channel.assertQueue(queueName, queuesConfig[queueName].queue);
      this.channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(message)),
        queuesConfig[queueName].queueSend
      );
    } catch (err) {
      console.warn(err);
    }
  }
}

export const queueProducer = new QueueProducer();
