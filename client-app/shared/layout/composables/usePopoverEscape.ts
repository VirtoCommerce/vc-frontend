import { onKeyStroke } from "@vueuse/core";
import { toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

/**
 * VcPopover takes Escape only in its panel and on its trigger: from anywhere else on the page, this closes the open
 * popover through its trigger. `isOpen` follows the popover's `toggle` event.
 */
export function usePopoverEscape(
  trigger: MaybeRefOrGetter<HTMLElement | null | undefined>,
  isOpen: MaybeRefOrGetter<boolean>,
): void {
  onKeyStroke("Escape", (event: KeyboardEvent) => {
    if (!toValue(isOpen) || event.defaultPrevented) {
      return;
    }

    toValue(trigger)?.click();
  });
}
