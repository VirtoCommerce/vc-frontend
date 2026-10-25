import { computed, shallowRef, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

type CheckoutGuardType = {
  /** True when the order can be placed as far as this guard is concerned. */
  canPlaceOrder: MaybeRefOrGetter<boolean>;
};

// Module-level: guards are registered by modules (e.g. a terms checkbox that must be accepted) and read by the
// Place order button, so modules can block checkout without the core importing module internals.
const guards = shallowRef(new Map<string, CheckoutGuardType>());

function unregisterGuard(id: string): void {
  const next = new Map(guards.value);
  next.delete(id);
  guards.value = next;
}

function registerGuard(id: string, guard: CheckoutGuardType): () => void {
  guards.value = new Map(guards.value).set(id, guard);
  return () => unregisterGuard(id);
}

const canPlaceOrder = computed(() => [...guards.value.values()].every((guard) => toValue(guard.canPlaceOrder)));

export function useCheckoutGuards() {
  return {
    registerGuard,
    unregisterGuard,
    canPlaceOrder,
  };
}
