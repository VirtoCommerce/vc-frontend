import { defaultWindow, tryOnMounted, unrefElement, useEventListener } from "@vueuse/core";
import { readonly, ref, unref } from "vue";
import type { IUseElementVisibilityOptions } from "../types";
import type { MaybeRef } from "@vueuse/core";
import type { ComponentPublicInstance } from "vue";

export function useElementVisibility(
  element: MaybeRef<HTMLElement | SVGElement | ComponentPublicInstance | null | undefined>,
  options: IUseElementVisibilityOptions = {}
) {
  const { scrollTarget, direction = "auto", margin = 0, window = defaultWindow } = options;

  const isVisible = ref(false);

  function checkVisibility() {
    const $element = unrefElement(element);

    if (!$element) {
      isVisible.value = false;
      return;
    }

    const rect = $element.getBoundingClientRect();
    const $direction = unref(direction);
    const $margin = unref(margin);

    if ($direction === "auto") {
      // TODO: add "margin" support
      isVisible.value =
        rect.top <= (window?.innerHeight || document.documentElement.clientHeight) &&
        rect.left <= (window?.innerWidth || document.documentElement.clientWidth) &&
        rect.bottom >= 0 &&
        rect.right >= 0;
    } else {
      const directionFactor: number = {
        // TODO: add support for "right" and "left"
        top: 1,
        bottom: -1,
      }[$direction];

      isVisible.value = rect[$direction] >= $margin * directionFactor;
    }
  }

  tryOnMounted(() => {
    checkVisibility();
    useEventListener(unrefElement(scrollTarget) || window, "scroll", checkVisibility, {
      capture: false,
      passive: true,
    });
  });

  return readonly(isVisible);
}
