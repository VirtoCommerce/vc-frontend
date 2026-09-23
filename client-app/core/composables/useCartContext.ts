import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";

/**
 * The name of the cart the application currently works with.
 *
 * Core never decides this on its own: it is an empty slot that an optional module fills in
 * (the punchout module points it at the cart its session was activated with). Empty means the
 * default cart, which is what every non-punchout visit gets.
 *
 * It is deliberately reactive rather than a value read once at boot: the cart queries pass it as
 * an Apollo variable, so switching it re-keys the cache and refetches instead of serving the
 * previous cart's cached result.
 */
function _useCartContext() {
  const cartName = ref<string>();

  function setCartName(name?: string | null) {
    cartName.value = name || undefined;
  }

  return {
    cartName: computed(() => cartName.value),
    setCartName,
  };
}

export const useCartContext = createGlobalState(_useCartContext);
