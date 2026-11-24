import { createSharedComposable } from "@vueuse/core";
import { computed } from "vue";
import { local } from "../utils";
import { useMinuteClock } from "./useMinuteClock";

/**
 * The start of the user's current day, as epoch ms. It changes once a day, so date windows built on it move on at
 * midnight while the page stays open, without re-running every minute in between.
 */
export const useToday = createSharedComposable(() => {
  const now = useMinuteClock();
  return computed(() => local(now.value.getFullYear(), now.value.getMonth(), now.value.getDate()));
});
