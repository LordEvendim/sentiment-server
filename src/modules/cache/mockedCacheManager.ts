import { cacheKeyFromArray } from "#utils/cache";
import { wait } from "#utils/wait";

import { CacheManager } from "./cacheManager";

export class MockedCacheManager implements CacheManager {
  private storage: Record<string, unknown>;

  constructor() {
    this.storage = {};
  }

  get = async <T>(keysArray: string[]) => {
    await wait(0);

    return this.storage[cacheKeyFromArray(keysArray)] as T | undefined;
  };

  set = async <T>(keysArray: string[], value: T) => {
    await wait(0);

    this.storage[cacheKeyFromArray(keysArray)] = value;
  };

  reset = async () => {
    await wait(0);

    this.storage = {};
  };
}
