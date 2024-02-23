import amqp from "amqplib";

class QueueConsumer {
  queueName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  async start() {
    try {
      const connection = await amqp.connect("amqp://localhost:5672");
      const channel = await connection.createChannel();

      process.once("SIGINT", async () => {
        await channel.close();
        await connection.close();
      });

      await channel.assertQueue(this.queueName, { durable: false });
      await channel.consume(
        this.queueName,
        (message) => {
          if (message) {
            console.log(
              " [x] Received '%s'",
              JSON.parse(message.content.toString())
            );
          }
        },
        { noAck: true }
      );

      console.log(" [*] Waiting for messages. To exit press CTRL+C");
    } catch (err) {
      console.warn(err);
    }
  }
}

export const queueConsumer = new QueueConsumer("queue");
