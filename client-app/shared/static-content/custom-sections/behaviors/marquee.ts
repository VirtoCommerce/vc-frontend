import { useEventListener, useResizeObserver } from "@vueuse/core";
import { REPEATED_COPY_ATTRIBUTE } from "./constants";
import { defineBehavior, isRightToLeft } from "./define-behavior";

const PAUSED_ATTRIBUTE = "data-paused";

/**
 * The renderer repeats the children once, the copies marked with `data-sb-repeat`. `--marquee-width` is the width
 * of one run, gap included; `--marquee-shift` is that distance toward the inline start, negative in left-to-right
 * text and positive in right-to-left. With reduced motion both are 0, so the loop stands still. The loop pauses
 * while the pointer is over it or the focus inside, and `data-paused` is set meanwhile.
 */
export const vMarquee = defineBehavior((element, { isReducedMotion }) => {
  if (isReducedMotion) {
    writeRun(element, 0);
    return;
  }

  function measure(): void {
    const first = element.firstElementChild;
    const firstCopy = element.querySelector(`:scope > [${REPEATED_COPY_ATTRIBUTE}]`);
    const width =
      first instanceof HTMLElement && firstCopy instanceof HTMLElement
        ? Math.abs(firstCopy.offsetLeft - first.offsetLeft)
        : element.scrollWidth / 2;

    writeRun(element, width);
  }

  let isHovered = false;
  let isFocused = false;

  function applyPause(): void {
    const isPaused = isHovered || isFocused;

    element.toggleAttribute(PAUSED_ATTRIBUTE, isPaused);
    // Whatever element the section's CSS animates.
    element
      .getAnimations?.({ subtree: true })
      .forEach((animation) => (isPaused ? animation.pause() : animation.play()));
  }

  measure();
  useResizeObserver(element, measure);
  useEventListener(element, "mouseenter", () => {
    isHovered = true;
    applyPause();
  });
  useEventListener(element, "mouseleave", () => {
    isHovered = false;
    applyPause();
  });
  useEventListener(element, "focusin", () => {
    isFocused = true;
    applyPause();
  });
  useEventListener(element, "focusout", (event: FocusEvent) => {
    isFocused = event.relatedTarget instanceof Node && element.contains(event.relatedTarget);
    applyPause();
  });
});

function writeRun(element: HTMLElement, width: number): void {
  element.style.setProperty("--marquee-width", `${width}px`);
  element.style.setProperty("--marquee-shift", `${isRightToLeft(element) ? width : -width}px`);
}
