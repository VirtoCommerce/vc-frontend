import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";
import { cache } from "@/core/api/graphql/config/cache";
import type { ApolloCache } from "@apollo/client/core";
import type { ApolloPersistOptions } from "apollo3-cache-persist/lib/types";

class ThemeCacheWrapper extends LocalStorageWrapper {
  removeItem(key: string): void {
    console.log("removeItem");
    super.removeItem(key);
  }

  setItem(key: string, value: string | null): void {
    if (super.getItem(key) === value) {
      console.log("setItem");
    }
    super.setItem(key, value);
  }
}

class ThemeCachePersistor<T> extends CachePersistor<T> {
  private originalApolloCache: ApolloCache<T>;
  private originalApolloGc: ApolloCache<T>["gc"];

  constructor(options: ApolloPersistOptions<T>) {
    super(options);

    this.originalApolloCache = options.cache;
    this.originalApolloGc = options.cache.gc;
    options.cache.gc = (...args: []) => {
      const result = this.originalApolloGc.apply(options.cache, args);
      void this.persist();
      return result;
    };
  }

  remove() {
    this.originalApolloCache.gc = this.originalApolloGc;
    super.remove();
  }
}

export const cachePersistor = new ThemeCachePersistor({
  cache,
  debounce: 0,
  key: "cache",
  maxSize: false,
  storage: new ThemeCacheWrapper(window.localStorage),
});
