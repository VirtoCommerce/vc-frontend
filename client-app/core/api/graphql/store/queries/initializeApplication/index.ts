import { InitializeApplicationDocument } from "@/core/api/graphql/types";
import { graphqlClient } from "../../../client";
import type { InitializeApplicationQuery } from "@/core/api/graphql/types";

type InitialStoreType = InitializeApplicationQuery["store"];

const CACHE_KEY_PREFIX = "vc-initialStore-v1:";
const CACHE_TTL_MS = 60 * 60 * 1000;

type CachedEntryType = {
  timestamp: number;
  data: InitialStoreType;
};

function readCache(domain: string): InitialStoreType | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + domain);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as CachedEntryType;
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      return undefined;
    }

    return parsed.data;
  } catch {
    return undefined;
  }
}

function writeCache(domain: string, data: InitialStoreType): void {
  try {
    const entry: CachedEntryType = { timestamp: Date.now(), data };
    localStorage.setItem(CACHE_KEY_PREFIX + domain, JSON.stringify(entry));
  } catch {
    // ignore quota / serialization errors
  }
}

export async function initializeApplication(domain: string) {
  const cached = readCache(domain);
  if (cached) {
    return cached;
  }

  const { data } = await graphqlClient.query({
    query: InitializeApplicationDocument,
    variables: {
      domain,
    },
  });

  if (data.store) {
    writeCache(domain, data.store);
  }

  return data.store;
}
