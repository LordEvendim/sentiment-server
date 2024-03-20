import { Redis, RedisOptions } from "ioredis";

import { logger } from "#modules/logger";

const devConfig = {} satisfies RedisOptions;

const prodConfig = {
  host: process.env.REDIS_INTERNAL_HOST,
  port: parseInt(process.env.REDIS_INTERNAL_PORT ?? "6379"),
} satisfies RedisOptions;

class RedisConnectionManager {
  public connection: Redis;

  constructor(connectionConfig: RedisOptions) {
    this.connection = new Redis(connectionConfig);

    this.connection.on("connect", () => logger.info("Connected to Redis"));
    this.connection.on("close", () => logger.warn("Disconnected from Redis"));
    this.connection.on("reconnecting", () =>
      logger.info("Reconnecting to Redis")
    );
  }
}

export const redisConnection = new RedisConnectionManager(
  process.env.NODE_ENV === "prod" ? prodConfig : devConfig
);
