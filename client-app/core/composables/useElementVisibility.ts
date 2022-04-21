import { ComponentPublicInstance, readonly, ref, unref } from "vue";
import { defaultWindow, MaybeRef, tryOnMounted, unrefElement, useEventListener } from "@vueuse/core";

export type useElementVisibilityOptions = {
  direction?: MaybeRef<"auto" | "top" | "bottom">; // TODO: add support for "right" and "left"
  margin?: MaybeRef<number>; // FIXME: Not used when "direction" is set to "auto"
  scrollTarget?: MaybeRef<HTMLElement | SVGElement | ComponentPublicInstance | null>;
  window?: Window;
};

export default function useElementVisibility(
  element: MaybeRef<HTMLElement | SVGElement | ComponentPublicInstance | null | undefined>,
  options: useElementVisibilityOptions = {}
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

  tryOnMounted(checkVisibility);

  if (window) {
    tryOnMounted(() =>
      useEventListener(unrefElement(scrollTarget) || window, "scroll", checkVisibility, {
        capture: false,
        passive: true,
      })
    );
  }

  return readonly(isVisible);
}
