import { useElementBounding, useWindowSize } from "@vueuse/core";
import { watchEffect } from "vue";
import { clamp, defineBehavior } from "./define-behavior";

const VARIABLE = "--scroll-progress";

/** `--scroll-progress` goes from 0, as the element enters the viewport at the bottom, to 1, as it leaves at the top. */
export const vScrollProgress = defineBehavior((element, { isReducedMotion }) => {
  if (isReducedMotion) {
    element.style.setProperty(VARIABLE, "1");
    return;
  }

  const { top, height } = useElementBounding(element);
  const { height: viewportHeight } = useWindowSize();

  watchEffect(() => {
    const distance = viewportHeight.value + height.value;
    const progress = distance > 0 ? clamp((viewportHeight.value - top.value) / distance, 0, 1) : 0;

    element.style.setProperty(VARIABLE, String(Math.round(progress * 1000) / 1000));
  });
});
