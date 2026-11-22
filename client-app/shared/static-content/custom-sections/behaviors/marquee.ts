import { useEventListener, useResizeObserver } from "@vueuse/core";
import { shallowRef, watch } from "vue";
import { REPEATED_COPY_ATTRIBUTE } from "./constants";
import { defineBehavior, isRightToLeft } from "./define-behavior";

const PAUSED_ATTRIBUTE = "data-paused";
const FOCUSABLE_SELECTOR = "a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]";

/**
 * Writes `--marquee-width` (one run, gap included) and `--marquee-shift` (toward the inline start), 0 under reduced
 * motion; pauses on hover or focus within, setting `data-paused`.
 */
export const vMarquee = defineBehavior((element, { isReducedMotion, updates }) => {
  if (isReducedMotion) {
    writeRun(element, 0);
    return;
  }

  /** From the first item with a box to its copy: the section's CSS may hide the first at some widths. */
  function measure(): void {
    const items = getItems(element);
    const run = items.filter((item) => !item.hasAttribute(REPEATED_COPY_ATTRIBUTE));
    const copies = items.filter((item) => item.hasAttribute(REPEATED_COPY_ATTRIBUTE));
    const index = run.findIndex((item, position) => hasBox(item) && !!copies[position] && hasBox(copies[position]));
    const width = index >= 0 ? Math.abs(copies[index].offsetLeft - run[index].offsetLeft) : element.scrollWidth / 2;

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

  // Its items too: a late image or a font swap resizes them inside a track whose own width is fixed.
  const items = shallowRef(getItems(element));
  watch(updates, () => {
    items.value = getItems(element);
  });

  // Focus within pauses it: with nothing to focus in its run, the keyboard reaches the strip itself.
  if (!element.hasAttribute("tabindex") && !hasFocusableItem(element)) {
    element.tabIndex = 0;
  }

  measure();
  useResizeObserver(() => [element, ...items.value], measure);
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

function getItems(element: HTMLElement): HTMLElement[] {
  return [...element.children].filter((child): child is HTMLElement => child instanceof HTMLElement);
}

function hasBox(element: HTMLElement): boolean {
  return element.getClientRects().length > 0;
}

/** The copies are inert, so only the run counts. */
function hasFocusableItem(element: HTMLElement): boolean {
  return [...element.querySelectorAll(FOCUSABLE_SELECTOR)].some(
    (item) => !item.closest(`[${REPEATED_COPY_ATTRIBUTE}]`),
  );
}
