import { onMounted, nextTick, toValue } from "vue";
import { focusFirstElement } from "@/core/utilities/focus";
import type { MaybeRefOrGetter } from "vue";

export interface IUseFocusManagementOptions {
  container?: MaybeRefOrGetter<HTMLElement | string>;
  autoFocus?: boolean;
  focusDelay?: number;
}

export interface IUseFocusManagementReturn {
  focusFirst: () => boolean;
}

export function useFocusManagement(options: IUseFocusManagementOptions = {}): IUseFocusManagementReturn {
  const { container: initialContainer, autoFocus = true, focusDelay = 0 } = options;

  function getContainer(): HTMLElement | null {
    if (!initialContainer) return null;

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
    if (!containerElement) return false;

    return focusFirstElement(containerElement);
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
