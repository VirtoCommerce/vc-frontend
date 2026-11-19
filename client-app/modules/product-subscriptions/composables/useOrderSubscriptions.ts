import { createGlobalState } from "@vueuse/core";
import { computed, ref, shallowRef, toValue } from "vue";
import { Logger } from "@/core/utilities";
import { getOrderSubscriptionInfos } from "../api/graphql";
import type { GetOrderSubscriptionInfosQuery } from "../api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

type OrderInfoType = GetOrderSubscriptionInfosQuery["orderSubscriptionInfos"][number];

/** The subscription behind an order line, as the order components show it. */
export type OrderLineSubscriptionType = {
  id: string;
  number: string;
  intervalUnit: OrderInfoType["subscriptions"][number]["intervalUnit"];
  intervalCount: number;
};

/** The renewal that placed an order on a delivery date. */
export type OrderRenewalType = {
  id: string;
  number?: string;
  scheduledDate: string;
};

/** The server answers at most this many orders per request: a page of order history. */
const BATCH_SIZE = 100;

/**
 * Which orders a subscription placed and which lines belong to a subscription. The server computes it per order
 * (`orderSubscriptionInfos`): the order components of a page ask for their orders, and the ids asked within one tick
 * go out in one request. An order is asked once per session.
 */
const useOrderSubscriptionsState = createGlobalState(() => {
  /** Order id -> its info, or null when the order has nothing to do with subscriptions. */
  const infos = shallowRef<Map<string, OrderInfoType | null>>(new Map());
  const loading = ref(false);
  const requested = new Set<string>();
  let queued = new Set<string>();
  let flush: Promise<void> | undefined;

  async function load(orderIds: string[]): Promise<void> {
    const next = new Map(infos.value);
    for (let i = 0; i < orderIds.length; i += BATCH_SIZE) {
      const batch = orderIds.slice(i, i + BATCH_SIZE);
      try {
        const result = await getOrderSubscriptionInfos(batch, { suppressErrorNotifications: true });
        batch.forEach((id) => next.set(id, null));
        result.forEach((info) => next.set(info.orderId, info));
      } catch (e) {
        // Asked again on the next visit.
        batch.forEach((id) => requested.delete(id));
        Logger.error(`${useOrderSubscriptions.name}.load`, e);
      }
    }
    infos.value = next;
  }

  /** Asks for this order's info unless it is known or already asked; orders asked in the same tick share a request. */
  function ensure(orderId: string): Promise<void> {
    if (!orderId || requested.has(orderId)) {
      return flush ?? Promise.resolve();
    }
    requested.add(orderId);
    queued.add(orderId);
    flush ??= Promise.resolve().then(async () => {
      const ids = [...queued];
      queued = new Set();
      flush = undefined;
      loading.value = true;
      try {
        await load(ids);
      } finally {
        loading.value = false;
      }
    });
    return flush;
  }

  function subscriptionFor(orderId: MaybeRefOrGetter<string>, productId: MaybeRefOrGetter<string | undefined>) {
    return computed<OrderLineSubscriptionType | undefined>(() => {
      const product = toValue(productId);
      const line = product
        ? infos.value.get(toValue(orderId))?.subscriptions.find((x) => x.productId === product)
        : undefined;
      return line
        ? {
            id: line.subscriptionId,
            number: line.subscriptionNumber,
            intervalUnit: line.intervalUnit,
            intervalCount: line.intervalCount,
          }
        : undefined;
    });
  }

  function renewalFor(orderId: MaybeRefOrGetter<string | undefined>) {
    return computed<OrderRenewalType | undefined>(() => {
      const id = toValue(orderId);
      const info = id ? infos.value.get(id) : undefined;
      return info?.renewalId && info.renewalScheduledDate
        ? { id: info.renewalId, number: info.renewalNumber ?? undefined, scheduledDate: info.renewalScheduledDate }
        : undefined;
    });
  }

  /** The subscriptions behind this order's lines, each once. */
  function subscriptionsOf(orderId: MaybeRefOrGetter<string | undefined>) {
    return computed(() => {
      const id = toValue(orderId);
      return (
        (id ? infos.value.get(id)?.subscriptions : undefined)?.map((x) => ({
          id: x.subscriptionId,
          number: x.subscriptionNumber,
        })) ?? []
      );
    });
  }

  return { ensure, subscriptionFor, subscriptionsOf, renewalFor, loading };
});

export function useOrderSubscriptions() {
  return useOrderSubscriptionsState();
}
