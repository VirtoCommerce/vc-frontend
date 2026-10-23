import { computed, onMounted, provide, ref, toValue } from "vue";
import { vcPopoverKey } from "../components/molecules/popover/vc-popover-context";
import type { MaybeRefOrGetter } from "vue";

// The app-level host in App.vue, also VcPopover's default `teleportSelector`.
const POPOVER_HOST_SELECTOR = "[id='popover-host']";

/**
 * Teleports the popovers (⋮ menus) of the calling component's descendants into the app-level popover host,
 * so they escape the card's stacking context and narrow columns. A popover with its own `enableTeleport`
 * keeps it. Where no host exists (unit tests, stories without the host decorator) popovers stay in place.
 */
export function usePopoverHostTeleport(enabled: MaybeRefOrGetter<boolean> = true): void {
  const hasPopoverHost = ref(false);

  provide(vcPopoverKey, { enableTeleport: computed(() => toValue(enabled) && hasPopoverHost.value) });

  onMounted(() => {
    hasPopoverHost.value = document.querySelector(POPOVER_HOST_SELECTOR) !== null;
  });
}
