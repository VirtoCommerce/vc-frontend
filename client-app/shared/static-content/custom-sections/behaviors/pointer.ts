import { createSharedComposable, useEventListener, useMediaQuery } from "@vueuse/core";
import { clamp, round } from "lodash-es";
import { watch } from "vue";
import { defineBehavior, isRightToLeft } from "./define-behavior";

const CENTER = 0.5;
const PRECISION = 3;

const useTouchScreen = createSharedComposable(() => useMediaQuery("(hover: none)"));

/**
 * `--pointer-x` and `--pointer-y` (0–1 inside the element), `--pointer-inline` (0 at the inline start, so it flips
 * in right-to-left text) and `--pointer-active`; off on touch screens.
 */
export const vPointer = defineBehavior((element, { isReducedMotion, updates }) => {
  // A bound `dir` changes without a remount: read again after every update.
  let isRtl = isRightToLeft(element);
  watch(updates, () => {
    isRtl = isRightToLeft(element);
  });

  writePointer(element, CENTER, CENTER, isRtl);
  element.style.setProperty("--pointer-active", "0");

  if (isReducedMotion || useTouchScreen().value) {
    return;
  }

  // Only the element's own events, and one layout read for each.
  useEventListener(
    element,
    "pointermove",
    (event: PointerEvent) => {
      const { left, top, width, height } = element.getBoundingClientRect();

      writePointer(element, toShare(event.clientX - left, width), toShare(event.clientY - top, height), isRtl);
      element.style.setProperty("--pointer-active", "1");
    },
    { passive: true },
  );
  useEventListener(element, "pointerleave", () => element.style.setProperty("--pointer-active", "0"), {
    passive: true,
  });
});

function toShare(offset: number, size: number): number {
  return size > 0 ? round(clamp(offset / size, 0, 1), PRECISION) : CENTER;
}

function writePointer(element: HTMLElement, x: number, y: number, isRtl: boolean): void {
  element.style.setProperty("--pointer-x", String(x));
  element.style.setProperty("--pointer-y", String(y));
  element.style.setProperty("--pointer-inline", String(isRtl ? round(1 - x, PRECISION) : x));
}
