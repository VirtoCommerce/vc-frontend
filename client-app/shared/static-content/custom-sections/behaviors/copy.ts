import { useClipboard, useEventListener } from "@vueuse/core";
import { watchEffect } from "vue";
import { globals } from "@/core/globals";
import { useNotifications } from "@/shared/notification";
import { defineBehavior } from "./define-behavior";

const COPIED_DURATION = 2000;
const COPIED_MESSAGE_KEY = "common.messages.copied_to_clipboard";
const NOTIFICATION_DURATION = 4000;
const NOTIFICATION_GROUP = "custom-section-copy";

/** A click, or Enter or Space, copies the text, sets `data-copied` for `COPIED_DURATION` and says so in a notification. */
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

  const notifications = useNotifications();

  async function copyText(): Promise<void> {
    await copy(value.value);
    notifications.success({
      text: globals.i18n?.global.t(COPIED_MESSAGE_KEY),
      duration: NOTIFICATION_DURATION,
      group: NOTIFICATION_GROUP,
      singleInGroup: true,
    });
  }

  useEventListener(element, "click", () => void copyText());
  useEventListener(element, "keydown", (event: KeyboardEvent) => {
    if (!isLink && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      void copyText();
    }
  });
});
