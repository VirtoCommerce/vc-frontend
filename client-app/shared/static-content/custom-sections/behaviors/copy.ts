import { useClipboard, useEventListener } from "@vueuse/core";
import { watchEffect } from "vue";
import { globals } from "@/core/globals";
import { defineBehavior } from "./define-behavior";

const COPIED_DURATION = 2000;
const COPIED_MESSAGE_KEY = "common.messages.copied_to_clipboard";
const LIVE_REGION_ATTRIBUTE = "data-sb-live-region";

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

  async function copyText(): Promise<void> {
    await copy(value.value);
    announce(globals.i18n?.global.t(COPIED_MESSAGE_KEY) ?? "");
  }

  useEventListener(element, "click", () => void copyText());
  useEventListener(element, "keydown", (event: KeyboardEvent) => {
    if (!isLink && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      void copyText();
    }
  });
});

/** One polite live region for the page; emptied first, so the same message is announced again. */
function announce(message: string): void {
  let region = document.querySelector<HTMLElement>(`[${LIVE_REGION_ATTRIBUTE}]`);

  if (!region) {
    region = document.createElement("div");
    region.setAttribute(LIVE_REGION_ATTRIBUTE, "");
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    region.className = "sr-only";
    document.body.append(region);
  }

  const target = region;
  target.textContent = "";
  requestAnimationFrame(() => {
    target.textContent = message;
  });
}
