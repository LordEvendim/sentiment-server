import amqp from "amqplib";

const text = {
  item_id: "macbook",
  text: "This is a sample message to send receiver to check the ordered Item Availablility",
};

class QueueProducer {
  queueName: string;
  isStarting: boolean = false;
  channel: amqp.Channel | undefined;
  connection: amqp.Connection | undefined;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  async start() {
    if (this.isStarting) return;

    try {
      this.isStarting = true;
      this.connection = await amqp.connect("amqp://localhost:5672");
      this.channel = await this.connection.createChannel();
    } finally {
      this.isStarting = false;
    }
  }

  async sendMessage() {
    try {
      if (!this.channel || !this.connection) {
        this.start();
        throw new Error("Connection with message broker is not established");
      }
      await this.channel.assertQueue(this.queueName, { durable: false });
      this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(text))
      );

      console.log(" [x] Sent '%s'", text);
      // await this.channel.close();
    } catch (err) {
      console.warn(err);
    }
  }
}

export const queueProducer = new QueueProducer("queue");
