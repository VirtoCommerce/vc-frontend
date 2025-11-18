import { onMounted, nextTick, toValue } from "vue";
import { focusFirstElement } from "@/ui-kit/utilities/focus";
import type { MaybeRefOrGetter } from "vue";

const FOCUS_IGNORE_SELECTOR = ".vc-select input"; // Comma-separated selectors to exclude from autofocus. Add more selectors as needed, e.g. ".vc-select input, .another-selector".
const FOCUS_EXTEND_SELECTOR = ".vc-select__container"; // comma separated selectors to extend the focusable elements.

export interface IUseFocusManagementOptions {
  container?: MaybeRefOrGetter<HTMLElement | string>;
  autoFocus?: boolean;
  focusDelay?: number;
}

export interface IUseFocusManagementReturn {
  focusFirst: () => boolean;
}

export function useFocusManagement(options: IUseFocusManagementOptions = {}): IUseFocusManagementReturn {
  const { container: initialContainer, autoFocus = false, focusDelay = 0 } = options;

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

  onMounted(async () => {
    if (autoFocus) {
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
  };
}
