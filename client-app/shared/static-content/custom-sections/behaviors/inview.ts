import { useEventListener, useIntersectionObserver, useResizeObserver } from "@vueuse/core";
import { effectScope, onScopeDispose, shallowRef, watch } from "vue";
import { toFiniteNumber } from "../numbers";
import { DEFAULT_INVIEW_THRESHOLD } from "./constants";
import { defineBehavior, readBooleanAttribute } from "./define-behavior";
import type { EffectScope } from "vue";

const VISIBLE_ATTRIBUTE = "data-visible";
/** The browser measures in fractions of a pixel. */
const SHARE_TOLERANCE = 1e-3;

/**
 * Sets `data-visible` while the threshold's share of the element is on screen, each axis counted against the smaller
 * of the element and the screen, so an element taller or wider than the screen shows too; with `-once` it stays.
 */
export const vInview = defineBehavior((element, { isReducedMotion }) => {
  if (isReducedMotion) {
    element.setAttribute(VISIBLE_ATTRIBUTE, "");
    return;
  }

  const isOnce = readBooleanAttribute(element, "data-inview-once");
  const threshold = toFiniteNumber(element.getAttribute("data-inview-threshold")) ?? DEFAULT_INVIEW_THRESHOLD;
  // The observer calls back only as the element's own ratio crosses a threshold: the one that means the share.
  const observedRatio = shallowRef(toObservedRatio(element, threshold));
  let observerScope: EffectScope | undefined;

  function onIntersect([entry]: IntersectionObserverEntry[]): void {
    const isVisible = !!entry?.isIntersecting && getVisibleShare(entry) >= threshold - SHARE_TOLERANCE;

    if (isVisible) {
      element.setAttribute(VISIBLE_ATTRIBUTE, "");
      if (isOnce) {
        observerScope?.stop();
      }
    } else if (!isOnce) {
      element.removeAttribute(VISIBLE_ATTRIBUTE);
    }
  }

  watch(
    observedRatio,
    (ratio) => {
      observerScope?.stop();
      observerScope = effectScope(true);
      observerScope.run(() => {
        const { stop } = useIntersectionObserver(element, onIntersect, { threshold: [0, ratio] });
        onScopeDispose(stop);
      });
    },
    { immediate: true },
  );

  function measure(): void {
    observedRatio.value = toObservedRatio(element, threshold);
  }

  useResizeObserver(element, measure);
  useEventListener(window, "resize", measure, { passive: true });
  onScopeDispose(() => observerScope?.stop());
});

/** The element's own ratio at which the share reaches the threshold, a tolerance below it as the share check. */
function toObservedRatio(element: HTMLElement, threshold: number): number {
  const { width, height } = element.getBoundingClientRect();
  const root = measureRoot();
  const excess = toExcess(width, root.width) * toExcess(height, root.height);

  return Math.min(1, Math.max(0, threshold - SHARE_TOLERANCE) / excess);
}

/** As the observer's root is: the viewport without its scrollbars. */
function measureRoot(): { width: number; height: number } {
  const { clientWidth, clientHeight } = document.documentElement;
  return { width: clientWidth || window.innerWidth, height: clientHeight || window.innerHeight };
}

/** How many screens the element spans on an axis, at least 1. */
function toExcess(size: number, rootSize: number): number {
  return size > rootSize && rootSize > 0 ? size / rootSize : 1;
}

/** Per axis, of the element or of the screen when the element is larger, multiplied. */
function getVisibleShare(entry: IntersectionObserverEntry): number {
  const root = entry.rootBounds ?? measureRoot();
  const rootWidth = root.width;
  const rootHeight = root.height;

  return (
    getAxisShare(entry.intersectionRect.width, entry.boundingClientRect.width, rootWidth) *
    getAxisShare(entry.intersectionRect.height, entry.boundingClientRect.height, rootHeight)
  );
}

function getAxisShare(visible: number, size: number, rootSize: number): number {
  const span = Math.min(size, rootSize);
  return span > 0 ? visible / span : 1;
}
