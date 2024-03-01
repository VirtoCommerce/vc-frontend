import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";
import { cache } from "@/core/api/graphql/config/cache";
import type { ApolloCache } from "@apollo/client/core";
import type { ApolloPersistOptions } from "apollo3-cache-persist/lib/types";

class ThemeCachePersistor<T> extends CachePersistor<T> {
  private originalApolloCache: ApolloCache<T>;
  private originalApolloGc: ApolloCache<T>["gc"];

  constructor(options: ApolloPersistOptions<T>) {
    super(options);

    // Workaround because of bug: authors of apollo3-cache-persist forgot to call save state on gc method
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
  storage: new LocalStorageWrapper(window.localStorage),
});
