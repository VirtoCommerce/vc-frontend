import { InMemoryCache } from "@apollo/client/core";
import { persistCache, SessionStorageWrapper } from "apollo3-cache-persist";

export const cache = new InMemoryCache();

export async function configureCache() {
  await persistCache({
    cache,
    storage: new SessionStorageWrapper(window.sessionStorage),
  });
}
