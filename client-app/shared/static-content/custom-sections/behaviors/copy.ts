import { useEventListener, useTimeoutFn } from "@vueuse/core";
import { shallowRef, watchEffect } from "vue";
import { globals } from "@/core/globals";
import { useNotifications } from "@/shared/notification";
import { COPIED_DURATION } from "./constants";
import { defineBehavior } from "./define-behavior";

const COPIED_MESSAGE_KEY = "common.messages.copied_to_clipboard";
const NOTIFICATION_DURATION = 4000;
const NOTIFICATION_GROUP = "custom-section-copy";

/**
 * A click, or Enter or Space on the element itself, copies the text. Once the text is on the clipboard, it sets
 * `data-copied` for `COPIED_DURATION` and says so in a notification; a copy the browser refuses says nothing.
 */
export const vCopy = defineBehavior((element, { value }) => {
  const isCopied = shallowRef(false);
  const { start: startCopied } = useTimeoutFn(() => (isCopied.value = false), COPIED_DURATION, { immediate: false });
  const isLink = element instanceof HTMLAnchorElement && element.hasAttribute("href");

  // Form controls are refused in a template, so an element that copies is made a button for the keyboard.
  if (!isLink) {
    if (!element.hasAttribute("role")) {
      element.setAttribute("role", "button");
    }
    element.tabIndex = 0;
  }

  watchEffect(() => element.toggleAttribute("data-copied", isCopied.value));

  const notifications = useNotifications();

  async function copyText(): Promise<void> {
    if (!(await writeToClipboard(value))) {
      return;
    }

    isCopied.value = true;
    startCopied();
    notifications.success({
      text: globals.i18n?.global.t(COPIED_MESSAGE_KEY),
      duration: NOTIFICATION_DURATION,
      group: NOTIFICATION_GROUP,
      singleInGroup: true,
    });
  }

  useEventListener(element, "click", () => void copyText());
  useEventListener(element, "keydown", (event: KeyboardEvent) => {
    // A link or a kit button inside handles its own keys.
    if (!isLink && event.target === element && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      void copyText();
    }
  });
});

/** Whether the text is on the clipboard: a frame without `clipboard-write` refuses the API, as may the older way. */
async function writeToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    return copyWithSelection(text);
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyWithSelection(text);
  }
}

function copyWithSelection(text: string): boolean {
  // Deprecated, yet the one way left where the clipboard API is refused; it says whether it copied.
  const execCommand: ((command: "copy") => boolean) | undefined =
    // eslint-disable-next-line sonarjs/deprecation
    typeof document.execCommand === "function" ? document.execCommand.bind(document) : undefined;

  if (!execCommand) {
    return false;
  }

  // In the viewport, so focusing it scrolls nothing; the focus goes back where it was.
  const focused = document.activeElement;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  Object.assign(field.style, { position: "fixed", top: "0", left: "0", opacity: "0" });
  document.body.append(field);
  field.focus({ preventScroll: true });
  field.select();
  const isCopied = execCommand("copy");
  field.remove();

  if (focused instanceof HTMLElement) {
    focused.focus({ preventScroll: true });
  }

  return isCopied;
}
