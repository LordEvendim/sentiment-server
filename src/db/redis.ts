import { Redis, RedisOptions } from "ioredis";

class RedisConnectionManager {
  public connection: Redis;

  constructor(connectionConfig: RedisOptions) {
    this.connection = new Redis(connectionConfig);

    this.connection.on("connect", () => console.log("Connected to Redis"));
    this.connection.on("close", () => console.log("Disconnected from Redis"));
    this.connection.on("reconnecting", () =>
      console.log("Reconnecting to Redis")
    );
  }
}

export const redisConnection = new RedisConnectionManager({});
