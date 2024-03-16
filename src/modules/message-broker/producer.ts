import amqp from "amqplib";

import { Queues, queuesConfig } from "./queues";

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
      this.connection = await amqp.connect("amqp://localhost:5672");
      this.channel = await this.connection.createChannel();
      this.channel.prefetch(1);
    } finally {
      this.isStarting = false;
    }
  }

  async sendMessage(queue: Queues, message: object) {
    try {
      if (!this.channel || !this.connection) {
        this.start();
        throw new Error("Connection with message broker is not established");
      }

      await this.channel.assertQueue(queue, queuesConfig[queue].queue);
      this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        queuesConfig[queue].queueSend
      );

      console.log(" [x] Sent '%s'", message);
    } catch (err) {
      console.warn(err);
    }
  }
}

export const queueProducer = new QueueProducer();
