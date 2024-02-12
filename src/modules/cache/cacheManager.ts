import { Cache, caching } from "cache-manager";
import { redisInsStore } from "cache-manager-ioredis-yet";
import { redisConnection } from "src/db/redis";

import { cacheKeyFromArray } from "#utils/cache";

export interface CacheManager {
  get: <T>(keysArray: string[]) => Promise<T | undefined>;
  set: <T>(keysArray: string[], value: T, ttl?: number) => Promise<void>;
  reset: () => Promise<void>;
}

export const createCacheManager = (
  cachingInstance: Promise<Cache>
): CacheManager => {
  return {
    get: async <T>(keysArray: string[]) => {
      const instance = await cachingInstance;

      return await instance.get<T>("cache:" + cacheKeyFromArray(keysArray));
    },
    set: async <T>(keysArray: string[], value: T, ttl?: number) => {
      const instance = await cachingInstance;

      return await instance.set(
        "cache:" + cacheKeyFromArray(keysArray),
        value,
        ttl
      );
    },
    reset: async () => {
      const instance = await cachingInstance;

      return await instance.reset();
    },
  };
};

export const redisCacheManager = createCacheManager(
  caching(redisInsStore(redisConnection.connection))
);
