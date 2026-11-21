import { useEventListener, useIntersectionObserver } from "@vueuse/core";
import { clamp, round } from "lodash-es";
import { onScopeDispose } from "vue";
import { defineBehavior } from "./define-behavior";

const VARIABLE = "--scroll-progress";
const PRECISION = 3;

/** `--scroll-progress` goes from 0, as the element enters the viewport at the bottom, to 1, as it leaves at the top. */
export const vScrollProgress = defineBehavior((element, { isReducedMotion }) => {
  if (isReducedMotion) {
    element.style.setProperty(VARIABLE, "1");
    return;
  }

  let isVisible = false;
  let frame = 0;

  function update(): void {
    frame = 0;
    const { top, height } = element.getBoundingClientRect();
    const distance = window.innerHeight + height;
    const progress = distance > 0 ? clamp((window.innerHeight - top) / distance, 0, 1) : 0;

    element.style.setProperty(VARIABLE, String(round(progress, PRECISION)));
  }

  function schedule(): void {
    frame ||= requestAnimationFrame(update);
  }

  // Off screen the element reads no layout: the last update before it left holds 0 or 1.
  useIntersectionObserver(element, ([entry]) => {
    isVisible = !!entry?.isIntersecting;
    schedule();
  });
  useEventListener(window, ["scroll", "resize"], () => isVisible && schedule(), { passive: true });
  onScopeDispose(() => cancelAnimationFrame(frame));
});
