import { useEventListener, useMutationObserver, useResizeObserver } from "@vueuse/core";
import { shallowRef, watch } from "vue";
import { REPEATED_COPY_ATTRIBUTE } from "../constants";
import { defineBehavior, isRightToLeft } from "./define-behavior";

const PAUSED_ATTRIBUTE = "data-paused";
const FOCUSABLE_SELECTOR =
  "a[href], area[href], button, input, select, textarea, summary, audio[controls], video[controls], [tabindex], " +
  "[contenteditable]";
const FOCUS_ATTRIBUTES = ["tabindex", "href", "disabled", "controls", "contenteditable"];

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
  // Focus within pauses it: with nothing to focus in its run, the keyboard reaches the strip itself.
  const isOwnTabStop = !element.hasAttribute("tabindex");

  /** Also later: an item's own behavior may load after this one and make the item focusable. */
  function placeTabStop(): void {
    const isNeeded = !hasFocusableItem(element);

    // Only on a change: the observer below sees this element's own `tabindex` too.
    if (!isOwnTabStop || isNeeded === element.hasAttribute("tabindex")) {
      return;
    }

    if (isNeeded) {
      element.tabIndex = 0;
    } else {
      element.removeAttribute("tabindex");
    }
  }

  // The items, or a bound `dir`, may change without a remount.
  watch(updates, () => {
    items.value = getItems(element);
    measure();
    placeTabStop();
  });

  placeTabStop();
  measure();
  useMutationObserver(element, placeTabStop, { subtree: true, childList: true, attributeFilter: FOCUS_ATTRIBUTES });
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

/** In the tab order: the copies are inert, so only the run counts, and a negative tabindex or a disabled control not. */
function hasFocusableItem(element: HTMLElement): boolean {
  return [...element.querySelectorAll(FOCUSABLE_SELECTOR)].some(
    (item) =>
      !item.closest(`[${REPEATED_COPY_ATTRIBUTE}]`) &&
      !item.matches(":disabled") &&
      Number(item.getAttribute("tabindex")) >= 0,
  );
}
