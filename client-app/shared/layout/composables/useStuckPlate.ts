import { useEventListener } from "@vueuse/core";
import { ref, watch } from "vue";
import type { Ref } from "vue";

/**
 * Whether a sticky plate has reached the top of the viewport.
 *
 * Read from geometry rather than `scrollY`: that stays correct through anchor jumps, resizes and
 * pages that do not start at zero. Capture phase, because the scroll may happen on an inner
 * container rather than on window.
 */
export function useStuckPlate(element: Ref<HTMLElement | null>) {
  const stuck = ref(false);

  function update() {
    if (element.value) {
      stuck.value = element.value.getBoundingClientRect().top <= 0.5;
    }
  }

  useEventListener("scroll", update, { passive: true, capture: true });
  useEventListener("resize", update);
  watch(element, update, { flush: "post" });

  return { stuck, update };
}
