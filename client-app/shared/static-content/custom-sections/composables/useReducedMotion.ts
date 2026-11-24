import { createSharedComposable, usePreferredReducedMotion } from "@vueuse/core";
import { computed } from "vue";

/** One media query listener for the page, however many sections and elements read it. */
export const useReducedMotion = createSharedComposable(() => {
  const preference = usePreferredReducedMotion();
  return computed(() => preference.value === "reduce");
});
