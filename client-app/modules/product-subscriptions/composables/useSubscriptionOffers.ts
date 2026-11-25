import { createGlobalState } from "@vueuse/core";
import { chunk } from "lodash-es";
import { computed, reactive } from "vue";
import { Logger } from "@/core/utilities";
import { getSubscriptionOffers } from "../api/graphql";
import type { GetSubscriptionOffersQuery } from "../api/graphql/types";

export type SubscriptionOfferType = NonNullable<GetSubscriptionOffersQuery["subscriptionOffers"]>[number];

/** The server prices at most this many products per request. */
const BATCH_SIZE = 100;

// Shared across components: one successful request per product id for the whole session. The ids asked within one
// tick go out together (a page of variations asks for its rows at once), in requests of at most BATCH_SIZE ids.
const useSubscriptionOffersState = createGlobalState(() => {
  const offers = reactive(new Map<string, SubscriptionOfferType | null>());
  const pending = new Map<string, Promise<void>>();
  let queued = new Set<string>();
  let flush: Promise<void> | undefined;

  async function fetchBatch(batch: string[]): Promise<void> {
    try {
      const result = await getSubscriptionOffers(batch);
      const byProduct = new Map((result ?? []).map((offer) => [offer.productId, offer]));
      batch.forEach((id) => offers.set(id, byProduct.get(id) ?? null));
    } catch (e) {
      // The ids stay unset, so the next call asks for them again.
      Logger.error(`${useSubscriptionOffers.name}.${loadOffers.name}`, e);
    }
  }

  async function fetchOffers(ids: string[]): Promise<void> {
    await Promise.all(chunk(ids, BATCH_SIZE).map(fetchBatch));
  }

  async function loadOffers(productIds: string[]): Promise<void> {
    const waiting = new Set<Promise<void>>();

    for (const id of new Set(productIds)) {
      if (!id || offers.has(id)) {
        continue;
      }
      const inFlight = pending.get(id);
      if (inFlight) {
        waiting.add(inFlight);
        continue;
      }

      queued.add(id);
      flush ??= Promise.resolve().then(async () => {
        const ids = [...queued];
        queued = new Set();
        flush = undefined;
        try {
          await fetchOffers(ids);
        } finally {
          ids.forEach((x) => pending.delete(x));
        }
      });
      pending.set(id, flush);
      waiting.add(flush);
    }

    await Promise.all(waiting);
  }

  function getOffer(productId: string | undefined) {
    return computed(() => (productId ? (offers.get(productId) ?? undefined) : undefined));
  }

  function offerFor(productId: string | undefined): SubscriptionOfferType | undefined {
    return productId ? (offers.get(productId) ?? undefined) : undefined;
  }

  return {
    loadOffers,
    getOffer,
    offerFor,
  };
});

export function useSubscriptionOffers() {
  return useSubscriptionOffersState();
}
