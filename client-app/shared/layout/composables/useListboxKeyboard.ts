import { useEventListener } from "@vueuse/core";
import { toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

const ARROW_STEPS = new Map([
  ["ArrowDown", 1],
  ["ArrowUp", -1],
]);

interface IListboxKeyboardOptions {
  /** Called with every option the keys focus. */
  onFocus?: (option: HTMLElement) => void;
}

/**
 * Listbox keys for options that are buttons: Up and Down move focus between the enabled options (wrapping), Home and
 * End go to the ends; selection stays on Enter, Space and click. VcPopover focuses its dialog on open, so from the
 * dialog itself Down enters the dialog's first listbox at its first option and Up at its last.
 */
export function useListboxKeyboard(
  listbox: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: IListboxKeyboardOptions = {},
) {
  // Disabled options are buttons that can't take focus, so the keys step over them.
  function getOptions(): HTMLElement[] {
    return Array.from(toValue(listbox)?.querySelectorAll<HTMLElement>("[role='option']:not(:disabled)") ?? []);
  }

  function focusOption(option: HTMLElement | undefined): void {
    if (!option) {
      return;
    }

    option.focus();
    options.onFocus?.(option);
  }

  /** One option on from `from`; from outside the list, Down enters at the first option and Up at the last. */
  function moveFocus(step: number, from: Element | null = document.activeElement): void {
    const elements = getOptions();
    let index = elements.indexOf(from as HTMLElement);

    if (index === -1 && step < 0) {
      index = 0;
    }

    focusOption(elements[(index + step + elements.length) % elements.length]);
  }

  function hasModifier(event: KeyboardEvent): boolean {
    return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  }

  useEventListener(listbox, "keydown", (event: KeyboardEvent) => {
    const elements = getOptions();

    if (hasModifier(event) || !elements.includes(event.target as HTMLElement)) {
      return;
    }

    const step = ARROW_STEPS.get(event.key);
    let target: HTMLElement | undefined;

    if (step) {
      event.preventDefault();
      moveFocus(step, event.target as HTMLElement);
      return;
    }

    if (event.key === "Home") {
      target = elements[0];
    } else if (event.key === "End") {
      target = elements.at(-1);
    }

    if (target) {
      event.preventDefault();
      focusOption(target);
    }
  });

  useEventListener(
    () => toValue(listbox)?.closest<HTMLElement>("[role='dialog']"),
    "keydown",
    (event: KeyboardEvent) => {
      const dialog = event.currentTarget as HTMLElement;
      const firstListbox = dialog.querySelector<HTMLElement>("[role='listbox']");
      const step = ARROW_STEPS.get(event.key);

      if (!step || hasModifier(event) || event.target !== dialog || firstListbox !== toValue(listbox)) {
        return;
      }

      event.preventDefault();
      moveFocus(step, null);
    },
  );

  return { moveFocus };
}
