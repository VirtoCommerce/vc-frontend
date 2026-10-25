import { computed, reactive } from "vue";
import { Logger } from "@/core/utilities";
import { getSubscriptionOffers } from "../api/graphql";
import type { GetSubscriptionOffersQuery } from "../api/graphql/types";

export type SubscriptionOfferType = NonNullable<GetSubscriptionOffersQuery["subscriptionOffers"]>[number];

// Shared across components: one request per product id for the whole session.
const offers = reactive(new Map<string, SubscriptionOfferType | null>());
const pending = new Map<string, Promise<void>>();

async function loadOffers(productIds: string[]): Promise<void> {
  const missing = [...new Set(productIds.filter((id) => id && !offers.has(id) && !pending.has(id)))];
  const waiting = productIds.map((id) => pending.get(id)).filter((x): x is Promise<void> => !!x);

  if (missing.length) {
    const request = (async () => {
      try {
        const result = await getSubscriptionOffers(missing);
        const byProduct = new Map((result ?? []).map((offer) => [offer.productId, offer]));
        missing.forEach((id) => offers.set(id, byProduct.get(id) ?? null));
      } catch (e) {
        Logger.error(`${useSubscriptionOffers.name}.${loadOffers.name}`, e);
        missing.forEach((id) => offers.set(id, null));
      } finally {
        missing.forEach((id) => pending.delete(id));
      }
    })();

    missing.forEach((id) => pending.set(id, request));
    waiting.push(request);
  }

  await Promise.all(waiting);
}

function getOffer(productId: string | undefined) {
  return computed(() => (productId ? (offers.get(productId) ?? undefined) : undefined));
}

function offerFor(productId: string | undefined): SubscriptionOfferType | undefined {
  return productId ? (offers.get(productId) ?? undefined) : undefined;
}

export function useSubscriptionOffers() {
  return {
    loadOffers,
    getOffer,
    offerFor,
  };
}
