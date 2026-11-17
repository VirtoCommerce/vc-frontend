import { createGlobalState } from "@vueuse/core";
import { computed, ref, shallowRef, toValue } from "vue";
import { Logger } from "@/core/utilities";
import { getProductSubscriptions, getSubscriptionRenewals } from "../api/graphql";
import { fetchAllPages } from "../utils";
import type { ProductSubscriptionFieldsFragment, RenewalFieldsFragment } from "../api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

const SUBSCRIPTIONS_PAGE_SIZE = 100;
const RENEWALS_PAGE_SIZE = 50;

/** Order id -> product id -> the subscription that put the product into the order. */
type OrderIndexType = Map<string, Map<string, ProductSubscriptionFieldsFragment>>;

/**
 * Which lines of a placed order were bought by subscription. The backend links them indirectly: a subscription keeps
 * its first and last order (`initialOrderId`, `lastOrderId`), and each delivery (renewal) keeps its order and items.
 * Loaded once for the session and again when an order isn't known yet (it may have been placed since).
 */
const useOrderSubscriptionsState = createGlobalState(() => {
  const index = shallowRef<OrderIndexType>(new Map());
  /** Orders the subscriptions placed themselves on a delivery's date: order id -> that delivery. */
  const renewalsByOrder = shallowRef<Map<string, RenewalFieldsFragment>>(new Map());
  const loadedOrderIds = new Set<string>();
  const loading = ref(false);
  let pending: Promise<void> | undefined;

  function add(
    target: OrderIndexType,
    orderId: string | null | undefined,
    productId: string,
    subscription: ProductSubscriptionFieldsFragment,
  ) {
    if (!orderId) {
      return;
    }
    const byProduct = target.get(orderId) ?? new Map<string, ProductSubscriptionFieldsFragment>();
    byProduct.set(productId, subscription);
    target.set(orderId, byProduct);
  }

  async function load(): Promise<void> {
    const options = { suppressErrorNotifications: true };
    const [subscriptions, renewals] = await Promise.all([
      fetchAllPages((page) => getProductSubscriptions(page, options), SUBSCRIPTIONS_PAGE_SIZE),
      fetchAllPages(
        (page) => getSubscriptionRenewals({ ...page, sort: "ScheduledDate:desc" }, options),
        RENEWALS_PAGE_SIZE,
      ),
    ]);

    const byId = new Map(subscriptions.map((x) => [x.id, x]));
    const next: OrderIndexType = new Map();
    const nextRenewals = new Map<string, RenewalFieldsFragment>();
    subscriptions.forEach((subscription) => {
      add(next, subscription.initialOrderId, subscription.productId, subscription);
      add(next, subscription.lastOrderId, subscription.productId, subscription);
    });
    renewals.forEach((renewal) => {
      if (renewal.orderId) {
        nextRenewals.set(renewal.orderId, renewal);
      }
      renewal.items.forEach((item) => {
        const subscription = byId.get(item.subscriptionId);
        if (subscription) {
          add(next, renewal.orderId, item.productId, subscription);
        }
      });
    });

    index.value = next;
    renewalsByOrder.value = nextRenewals;
    next.forEach((_, orderId) => loadedOrderIds.add(orderId));
  }

  /** Loads the links unless this order is already known; one request at a time. */
  async function ensure(orderId: string): Promise<void> {
    if (loadedOrderIds.has(orderId)) {
      return;
    }
    pending ??= (async () => {
      loading.value = true;
      try {
        await load();
      } catch (e) {
        Logger.error(`${useOrderSubscriptions.name}.${ensure.name}`, e);
      } finally {
        loading.value = false;
        pending = undefined;
      }
    })();
    await pending;
    // An order without subscription lines is known too, so it isn't asked about again.
    loadedOrderIds.add(orderId);
  }

  function subscriptionFor(orderId: MaybeRefOrGetter<string>, productId: MaybeRefOrGetter<string | undefined>) {
    return computed(() => {
      const product = toValue(productId);
      return product ? index.value.get(toValue(orderId))?.get(product) : undefined;
    });
  }

  function renewalFor(orderId: MaybeRefOrGetter<string | undefined>) {
    return computed(() => {
      const id = toValue(orderId);
      return id ? renewalsByOrder.value.get(id) : undefined;
    });
  }

  /** The subscriptions that put products into this order, each once. */
  function subscriptionsOf(orderId: MaybeRefOrGetter<string | undefined>) {
    return computed(() => {
      const id = toValue(orderId);
      const byProduct = id ? index.value.get(id) : undefined;
      return byProduct ? [...new Set(byProduct.values())] : [];
    });
  }

  return { ensure, subscriptionFor, subscriptionsOf, renewalFor, loading };
});

export function useOrderSubscriptions() {
  return useOrderSubscriptionsState();
}
