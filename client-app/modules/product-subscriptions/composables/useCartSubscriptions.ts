import { computed, reactive, toValue, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import { useFullCart, useShortCart } from "@/shared/cart/composables";
import { getCartSubscriptionItems, removeCartItemSubscription, setCartItemSubscription } from "../api/graphql";
import { useSubscriptionOffers } from "./useSubscriptionOffers";
import type { SubscriptionCartItemFieldsFragment, SubscriptionIntervalUnit } from "../api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

/** The parts of a cart this module reads; the short cart has no `selectedForCheckout`, so its lines count as selected. */
export interface ISubscriptionCartType {
  id?: string;
  items?: { id: string; productId?: string; selectedForCheckout?: boolean }[] | null;
}

type CartStateType = "loading" | "loaded" | "failed";

// Shared across components and kept per cart: the cart page and checkout may show a cart other than the default one.
const itemsByCart = reactive(new Map<string, SubscriptionCartItemFieldsFragment[]>());
const stateByCart = reactive(new Map<string, CartStateType>());
const pendingLoads = new Map<string, Promise<void>>();

async function load(cartId: string): Promise<void> {
  const pending = pendingLoads.get(cartId);
  if (pending) {
    return pending;
  }

  const request = (async () => {
    stateByCart.set(cartId, "loading");
    try {
      itemsByCart.set(cartId, (await getCartSubscriptionItems(cartId)) ?? []);
      stateByCart.set(cartId, "loaded");
    } catch (e) {
      Logger.error(`useCartSubscriptions.${load.name}`, e);
      stateByCart.set(cartId, "failed");
    } finally {
      pendingLoads.delete(cartId);
    }
  })();

  pendingLoads.set(cartId, request);
  return request;
}

/**
 * The subscriptions chosen for the lines of a cart. Pass the cart the page shows; `useCurrentCartSubscriptions` and
 * `useDefaultCartSubscriptions` do that for the cart and checkout pages and for the product page.
 */
export function useCartSubscriptions(
  cartSource: MaybeRefOrGetter<ISubscriptionCartType | undefined>,
  options: { loadOffers?: boolean } = {},
) {
  const { isAuthenticated } = useUser();
  const { loadOffers } = useSubscriptionOffers();

  const cart = computed(() => toValue(cartSource));
  const cartId = computed(() => cart.value?.id);
  const items = computed(() => (cartId.value ? (itemsByCart.get(cartId.value) ?? []) : []));
  const state = computed(() => (cartId.value ? stateByCart.get(cartId.value) : undefined));

  const loading = computed(
    () => state.value === "loading" || (!!cartId.value && isAuthenticated.value && !state.value),
  );
  const failed = computed(() => state.value === "failed");
  const byLineItemId = computed(() => new Map(items.value.map((item) => [item.lineItemId, item])));

  /** Lines that are in the order: a line left out of checkout creates no subscription. */
  const orderedLineIds = computed(
    () => new Set((cart.value?.items ?? []).filter((x) => x.selectedForCheckout !== false).map((x) => x.id)),
  );
  const subscribedItems = computed(() => items.value.filter((item) => orderedLineIds.value.has(item.lineItemId)));
  const hasSubscriptionItems = computed(() => subscribedItems.value.length > 0);

  async function refresh(): Promise<void> {
    if (!cartId.value || !isAuthenticated.value) {
      return;
    }

    await load(cartId.value);
  }

  function setItems(update: (current: SubscriptionCartItemFieldsFragment[]) => SubscriptionCartItemFieldsFragment[]) {
    if (cartId.value) {
      itemsByCart.set(cartId.value, update(itemsByCart.get(cartId.value) ?? []));
    }
  }

  async function setSubscription(
    lineItemId: string,
    planId: string,
    intervalUnit: SubscriptionIntervalUnit,
    intervalCount: number,
  ) {
    if (!cartId.value || !globals.storeId) {
      return;
    }

    const item = await setCartItemSubscription({
      storeId: globals.storeId,
      cartId: cartId.value,
      lineItemId,
      planId,
      intervalUnit,
      intervalCount,
    });

    if (item) {
      setItems((current) => [...current.filter((x) => x.lineItemId !== lineItemId), item]);
    }
  }

  async function removeSubscription(lineItemId: string) {
    if (!cartId.value) {
      return;
    }

    await removeCartItemSubscription({ cartId: cartId.value, lineItemId });
    setItems((current) => current.filter((x) => x.lineItemId !== lineItemId));
  }

  watch(
    [cartId, isAuthenticated],
    ([id, authenticated]) => {
      if (id && authenticated && !stateByCart.has(id)) {
        void load(id);
      }
    },
    { immediate: true },
  );

  // One offers request for every product in the cart, not one per line.
  if (options.loadOffers) {
    watch(
      () => (cart.value?.items ?? []).map((x) => x.productId).filter((id): id is string => !!id),
      (productIds) => {
        if (productIds.length) {
          void loadOffers(productIds);
        }
      },
      { immediate: true },
    );
  }

  return {
    items,
    subscribedItems,
    byLineItemId,
    hasSubscriptionItems,
    loading,
    failed,
    refresh,
    setSubscription,
    removeSubscription,
  };
}

/** The cart the cart and checkout pages show (the route's cart, or the default one), with its products' offers. */
export function useCurrentCartSubscriptions() {
  const { cart } = useFullCart();
  return useCartSubscriptions(cart, { loadOffers: true });
}

/** The default cart, which the product page adds to. */
export function useDefaultCartSubscriptions() {
  const { cart } = useShortCart();
  return useCartSubscriptions(cart);
}
