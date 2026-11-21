import { useClipboard, useEventListener } from "@vueuse/core";
import { watchEffect } from "vue";
import { defineBehavior } from "./define-behavior";

const COPIED_DURATION = 2000;

/** A click, or Enter or Space, copies the text and sets `data-copied` for 2 seconds. */
export const vCopy = defineBehavior((element, { value }) => {
  const { copy, copied } = useClipboard({ copiedDuring: COPIED_DURATION, legacy: true });
  const isLink = element instanceof HTMLAnchorElement && element.hasAttribute("href");

  // Form controls are refused in a template, so an element that copies is made a button for the keyboard.
  if (!isLink) {
    if (!element.hasAttribute("role")) {
      element.setAttribute("role", "button");
    }
    element.tabIndex = 0;
  }

  watchEffect(() => element.toggleAttribute("data-copied", copied.value));

  useEventListener(element, "click", () => void copy(value.value));
  useEventListener(element, "keydown", (event: KeyboardEvent) => {
    if (!isLink && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      void copy(value.value);
    }
  });
});
