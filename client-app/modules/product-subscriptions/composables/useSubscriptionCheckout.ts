import { createGlobalState } from "@vueuse/core";
import { computed, ref, shallowRef } from "vue";
import { useCartSubscriptions } from "./useCartSubscriptions";
import type { ISubscriptionCartType } from "./useCartSubscriptions";

/**
 * The subscription terms of the checkout being reviewed, shared by the terms block and the checkout guard. The guard
 * is registered by the module's `init()`, before the block's chunk loads, so Place order stays closed until the block
 * shows: the block sets the cart it reviews, and the order waits for that cart's subscriptions to be known and, when
 * it has any, for the terms to be accepted. A block that never loads keeps it closed.
 */
const useSubscriptionCheckoutState = createGlobalState(() => {
  /** The cart the checkout review shows; set by the terms block while it is mounted. */
  const cart = shallowRef<ISubscriptionCartType>();
  /** The terms are accepted for this checkout. */
  const accepted = ref(false);

  const subscriptions = useCartSubscriptions(cart);
  const { loading, failed, hasSubscriptionItems } = subscriptions;

  const canPlaceOrder = computed(
    () => !!cart.value?.id && !loading.value && !failed.value && (!hasSubscriptionItems.value || accepted.value),
  );

  return { cart, accepted, subscriptions, canPlaceOrder };
});

export function useSubscriptionCheckout() {
  return useSubscriptionCheckoutState();
}
