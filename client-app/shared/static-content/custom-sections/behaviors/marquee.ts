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
  removeCopiesFromTabOrder(element);

  if (isReducedMotion) {
    writeRun(element, 0);
    useMutationObserver(element, () => removeCopiesFromTabOrder(element), {
      subtree: true,
      childList: true,
      attributeFilter: FOCUS_ATTRIBUTES,
    });
    return;
  }

  /**
   * From the first item with a box to its copy: the section's CSS may hide the first at some widths. Unrounded, so
   * a loop does not snap by a fraction of a pixel; both sit in the same track, so its shift cancels out.
   */
  function measure(): void {
    const items = getItems(element);
    const run = items.filter((item) => !item.hasAttribute(REPEATED_COPY_ATTRIBUTE));
    const copies = items.filter((item) => item.hasAttribute(REPEATED_COPY_ATTRIBUTE));
    const index = run.findIndex((item, position) => hasBox(item) && !!copies[position] && hasBox(copies[position]));
    const width = index >= 0 ? Math.abs(getLeft(copies[index]) - getLeft(run[index])) : element.scrollWidth / 2;

    writeRun(element, width);
  }

  let isHovered = false;
  let isFocused = false;
  let paused: HTMLElement[] = [];

  /**
   * Through an inline play state, not `Animation.pause()`, after which the section's CSS could no longer pause or
   * run the animation. Resumes only what it paused, so a finished or a CSS-paused animation stays as it is.
   */
  function applyPause(): void {
    const isPaused = isHovered || isFocused;

    element.toggleAttribute(PAUSED_ATTRIBUTE, isPaused);

    if (isPaused && !paused.length) {
      paused = getAnimatedElements(element);
      paused.forEach((animated) => animated.style.setProperty("animation-play-state", "paused"));
    } else if (!isPaused) {
      paused.forEach((animated) => animated.style.removeProperty("animation-play-state"));
      paused = [];
    }
  }

  // Its items too: a late image or a font swap resizes them inside a track whose own width is fixed.
  const items = shallowRef(getItems(element));
  // Focus within pauses it: with nothing to focus in its run, the keyboard reaches the strip itself.
  let hasSetTabStop = false;

  /**
   * Also later: an item's own behavior may load after this one and make the item focusable. Removes only a tab stop
   * it set: another behavior on the strip, as `data-copy`, may set one of its own. Only on a change: the observer
   * below sees this element's own `tabindex` too.
   */
  function placeTabStop(): void {
    removeCopiesFromTabOrder(element);

    const isNeeded = !hasFocusableItem(element);

    if (isNeeded && !element.hasAttribute("tabindex")) {
      element.tabIndex = 0;
      hasSetTabStop = true;
    } else if (!isNeeded && hasSetTabStop) {
      element.removeAttribute("tabindex");
      hasSetTabStop = false;
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

/** Whatever elements the section's CSS animates, running now. */
function getAnimatedElements(element: HTMLElement): HTMLElement[] {
  const animated = (element.getAnimations?.({ subtree: true }) ?? [])
    .filter(({ playState }) => playState === "running")
    .map(({ effect }) => (effect as KeyframeEffect | null)?.target)
    .filter((target): target is HTMLElement => target instanceof HTMLElement);

  return [...new Set(animated)];
}

function getItems(element: HTMLElement): HTMLElement[] {
  return [...element.children].filter((child): child is HTMLElement => child instanceof HTMLElement);
}

function getLeft(element: HTMLElement): number {
  return element.getBoundingClientRect().left;
}

function hasBox(element: HTMLElement): boolean {
  return element.getClientRects().length > 0;
}

/**
 * The copies stay clickable, as a loop mostly shows them, but the keyboard reaches each item once, in the run. Only
 * on a change: the observers see `tabindex` too.
 */
function removeCopiesFromTabOrder(element: HTMLElement): void {
  for (const copy of element.querySelectorAll<HTMLElement>(`[${REPEATED_COPY_ATTRIBUTE}]`)) {
    for (const item of [copy, ...copy.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)]) {
      if (item.matches(FOCUSABLE_SELECTOR) && item.getAttribute("tabindex") !== "-1") {
        item.tabIndex = -1;
      }
    }
  }
}

/** In the tab order: the copies are out of it, so only the run counts, and a negative tabindex or a disabled control not. */
function hasFocusableItem(element: HTMLElement): boolean {
  return [...element.querySelectorAll(FOCUSABLE_SELECTOR)].some(
    (item) =>
      !item.closest(`[${REPEATED_COPY_ATTRIBUTE}]`) &&
      !item.matches(":disabled") &&
      Number(item.getAttribute("tabindex")) >= 0,
  );
}
