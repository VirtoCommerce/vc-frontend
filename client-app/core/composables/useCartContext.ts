import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";

// Overrides the name of the cart the application is currently working with.
// Core doesn't decides this on its own, it is an empty slot that an optional module fills in,
// made for the Punchout module, currently.
// Empty means the "default" cart.
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
