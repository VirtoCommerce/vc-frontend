import { useEventListener, useResizeObserver } from "@vueuse/core";
import { REPEATED_COPY_ATTRIBUTE } from "./constants";
import { defineBehavior, isRightToLeft } from "./define-behavior";

const PAUSED_ATTRIBUTE = "data-paused";

/**
 * Writes `--marquee-width` (one run, gap included) and `--marquee-shift` (toward the inline start), 0 under reduced
 * motion; pauses on hover or focus within, setting `data-paused`.
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
  let paused: Animation[] = [];

  /** Resumes only what it paused, so a finished or a CSS-paused animation stays as it is. */
  function applyPause(): void {
    const isPaused = isHovered || isFocused;

    element.toggleAttribute(PAUSED_ATTRIBUTE, isPaused);

    if (isPaused && !paused.length) {
      // Whatever element the section's CSS animates.
      paused = (element.getAnimations?.({ subtree: true }) ?? []).filter(({ playState }) => playState === "running");
      paused.forEach((animation) => animation.pause());
    } else if (!isPaused) {
      paused.forEach((animation) => animation.play());
      paused = [];
    }
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
