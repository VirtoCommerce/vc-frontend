import { createSharedComposable, usePreferredReducedMotion } from "@vueuse/core";

/** One media query listener for the page, however many sections and elements read it. */
export const useReducedMotion = createSharedComposable(() => usePreferredReducedMotion());
