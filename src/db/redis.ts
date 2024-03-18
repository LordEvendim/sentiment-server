import { Redis, RedisOptions } from "ioredis";

import { logger } from "#modules/logger";

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

export const redisConnection = new RedisConnectionManager({});
