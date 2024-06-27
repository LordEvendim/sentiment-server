import { Redis, RedisOptions } from "ioredis";

import { logger } from "#modules/logger";

const devConfig = process.env.REDIS_DEV_URL ?? ({} satisfies RedisOptions);

const prodConfig = process.env.REDIS_PRIVATE_URL! + "?family=0";

class RedisConnectionManager {
  public connection: Redis;

  constructor(connectionConfig: RedisOptions) {
    this.connection = new Redis(connectionConfig);

    this.connection.on("connect", () => logger.info("Redis: connected"));
    this.connection.on("close", () => logger.warn("Redis: disconnected"));
    this.connection.on("reconnecting", () =>
      logger.info("Redis: reconnecting")
    );
  }
}

export const redisConnection = new RedisConnectionManager(
  process.env.NODE_ENV === "dev" ? devConfig : prodConfig
);
