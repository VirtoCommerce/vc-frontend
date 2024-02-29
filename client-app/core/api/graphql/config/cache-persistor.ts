import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";
import { cache } from "@/core/api/graphql/config/cache";

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

export const cachePersistor = new CachePersistor({
  cache,
  debounce: 0,
  key: "cache",
  maxSize: false,
  storage: new ThemeCacheWrapper(window.localStorage),
});
