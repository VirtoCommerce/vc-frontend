import { onMounted, nextTick, toValue } from "vue";
import { focusFirstElement } from "@/ui-kit/utilities/focus";
import type { MaybeRefOrGetter } from "vue";

const FOCUS_IGNORE_SELECTOR = ".vc-select input"; // Comma-separated selectors to exclude from autofocus. Add more selectors as needed, e.g. ".vc-select input, .another-selector".
const FOCUS_EXTEND_SELECTOR = ".vc-select__container"; // comma separated selectors to extend the focusable elements.

const TRAP_FOCUSABLE_SELECTOR =
  'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export interface IUseFocusManagementOptions {
  container?: MaybeRefOrGetter<HTMLElement | string>;
  autoFocus?: MaybeRefOrGetter<boolean>;
  focusDelay?: number;
  trapFocus?: MaybeRefOrGetter<boolean>;
}

export interface IUseFocusManagementReturn {
  focusFirst: () => boolean;
  onKeydown: (event: KeyboardEvent) => void;
}

export function useFocusManagement(options: IUseFocusManagementOptions = {}): IUseFocusManagementReturn {
  const { container: initialContainer, autoFocus = false, focusDelay = 0, trapFocus = false } = options;

  function getContainer(): HTMLElement | null {
    if (!initialContainer) {
      return null;
    }

    const containerValue = toValue(initialContainer);

    if (typeof containerValue === "string") {
      return document.querySelector(containerValue);
    }

    if (containerValue instanceof HTMLElement) {
      return containerValue;
    }

    return null;
  }

  function focusFirst(): boolean {
    const containerElement = getContainer();
    if (!containerElement) {
      return false;
    }

    return focusFirstElement(containerElement, {
      ignoreSelector: FOCUS_IGNORE_SELECTOR,
      extendSelector: FOCUS_EXTEND_SELECTOR,
    });
  }

  function onKeydown(event: KeyboardEvent) {
    if (!toValue(trapFocus) || event.key !== "Tab") {
      return;
    }

    const containerEl = getContainer();

    if (!containerEl) {
      return;
    }

    const focusableElements = [...containerEl.querySelectorAll(TRAP_FOCUSABLE_SELECTOR)] as HTMLElement[];

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  onMounted(async () => {
    if (toValue(autoFocus)) {
      const focus = () => {
        if (focusDelay > 0) {
          setTimeout(() => focusFirst(), focusDelay);
        } else {
          focusFirst();
        }
      };

      await nextTick();
      focus();
    }
  });

  return {
    focusFirst,
    onKeydown,
  };
}
