import { createGlobalState } from "@vueuse/core";
import { computed, ref, shallowRef } from "vue";
import { useCartSubscriptions } from "./useCartSubscriptions";
import type { ISubscriptionCartType } from "./useCartSubscriptions";

/**
 * The subscription terms of the checkout being reviewed, shared by the terms block and the checkout guard. The block
 * sets the cart it reviews; the guard holds the order while that cart's subscriptions load, and when it has any, until
 * the terms are accepted. It blocks nothing else: with no block on the page or a failed load the server still refuses
 * an order with subscription lines and no consent (`SUBSCRIPTION_TERMS_NOT_ACCEPTED`).
 */
const useSubscriptionCheckoutState = createGlobalState(() => {
  /** The cart the checkout review shows; set by the terms block while it is mounted. */
  const cart = shallowRef<ISubscriptionCartType>();
  /** The terms are accepted for this checkout. */
  const accepted = ref(false);

  const subscriptions = useCartSubscriptions(cart);
  const { loading, hasSubscriptionItems } = subscriptions;

  const canPlaceOrder = computed(() => !loading.value && (!hasSubscriptionItems.value || accepted.value));

  return { cart, accepted, subscriptions, canPlaceOrder };
});

export function useSubscriptionCheckout() {
  return useSubscriptionCheckoutState();
}
