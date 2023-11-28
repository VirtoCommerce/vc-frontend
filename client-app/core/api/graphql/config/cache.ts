import { InMemoryCache } from "@apollo/client/core";
import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";
import { IS_CLIENT } from "@/core/constants";

export const cache = new InMemoryCache();

export const cachePersistor = IS_CLIENT
  ? new CachePersistor({
      cache,
      debounce: 0,
      maxSize: false,
      storage: new LocalStorageWrapper(window.localStorage),
    })
  : null;
