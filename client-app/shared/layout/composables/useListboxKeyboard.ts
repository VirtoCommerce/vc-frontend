import { useEventListener } from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";

const ARROW_STEPS = new Map([
  ["ArrowDown", 1],
  ["ArrowUp", -1],
]);

/**
 * Listbox keys for options that are buttons, each its own tab stop: Up and Down move focus between the
 * enabled options (wrapping), Home and End go to the ends. Selection stays on Enter, Space and click.
 */
export function useListboxKeyboard(listbox: MaybeRefOrGetter<HTMLElement | null | undefined>): void {
  useEventListener(listbox, "keydown", (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const root = event.currentTarget as HTMLElement;
    const options = Array.from(root.querySelectorAll<HTMLElement>("[role='option']:not(:disabled)"));
    const index = options.indexOf(event.target as HTMLElement);

    if (index === -1) {
      return;
    }

    const step = ARROW_STEPS.get(event.key);
    let target: HTMLElement | undefined;

    if (step) {
      target = options[(index + step + options.length) % options.length];
    } else if (event.key === "Home") {
      target = options[0];
    } else if (event.key === "End") {
      target = options.at(-1);
    }

    if (!target) {
      return;
    }

    event.preventDefault();
    target.focus();
  });
}
