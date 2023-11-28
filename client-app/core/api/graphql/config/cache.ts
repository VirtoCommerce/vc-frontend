import { InMemoryCache } from "@apollo/client/core";
import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";

export const cache = new InMemoryCache();

export const cachePersistor = new CachePersistor({
  cache,
  debounce: 0,
  maxSize: false,
  storage: new LocalStorageWrapper(window.localStorage),
});
