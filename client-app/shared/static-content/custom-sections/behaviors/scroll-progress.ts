import { useEventListener, useIntersectionObserver } from "@vueuse/core";
import { onScopeDispose } from "vue";
import { toUnitShare } from "../numbers";
import { defineBehavior } from "./define-behavior";

const VARIABLE = "--scroll-progress";

/** Elements to update at the next frame, shared: every rect is read before any variable is written. */
const scheduled = new Set<HTMLElement>();
let frame = 0;

/** `--scroll-progress` goes from 0, as the element enters the viewport at the bottom, to 1, as it leaves at the top. */
export const vScrollProgress = defineBehavior((element, { isReducedMotion }) => {
  if (isReducedMotion) {
    element.style.setProperty(VARIABLE, "1");
    return;
  }

  let isVisible = false;

  // Off screen the element reads no layout: the last update before it left holds 0 or 1.
  useIntersectionObserver(element, ([entry]) => {
    isVisible = !!entry?.isIntersecting;
    schedule(element);
  });

  const onChange = () => isVisible && schedule(element);

  // In the capture phase, a scroll inside any scroller of the page reaches the window too.
  useEventListener(window, "scroll", onChange, { capture: true, passive: true });
  useEventListener(window, "resize", onChange, { passive: true });
  onScopeDispose(() => unschedule(element));
});

function schedule(element: HTMLElement): void {
  scheduled.add(element);
  frame ||= requestAnimationFrame(update);
}

function unschedule(element: HTMLElement): void {
  scheduled.delete(element);

  if (!scheduled.size) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

function update(): void {
  const progress = [...scheduled].map((element) => [element, readProgress(element)] as const);

  frame = 0;
  scheduled.clear();
  progress.forEach(([element, value]) => element.style.setProperty(VARIABLE, String(value)));
}

function readProgress(element: HTMLElement): number {
  const { top, height } = element.getBoundingClientRect();
  const distance = window.innerHeight + height;

  return distance > 0 ? toUnitShare((window.innerHeight - top) / distance) : 0;
}
