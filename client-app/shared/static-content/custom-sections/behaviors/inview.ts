import { useIntersectionObserver } from "@vueuse/core";
import { toFiniteNumber } from "../numbers";
import { defineBehavior, readBooleanAttribute } from "./define-behavior";

const DEFAULT_THRESHOLD = 0.2;
const VISIBLE_ATTRIBUTE = "data-visible";
/** Every hundredth of the element: one taller than the viewport is never seen whole, so it is heard of in steps. */
const OBSERVED_SHARES = Array.from({ length: 101 }, (_, index) => index / 100);

/**
 * Sets `data-visible` while the threshold's share of the element is on screen, or of the viewport for an element
 * taller than it; with `-once` it stays.
 */
export const vInview = defineBehavior((element, { isReducedMotion }) => {
  if (isReducedMotion) {
    element.setAttribute(VISIBLE_ATTRIBUTE, "");
    return;
  }

  const isOnce = readBooleanAttribute(element, "data-inview-once");
  const threshold = toFiniteNumber(element.getAttribute("data-inview-threshold")) ?? DEFAULT_THRESHOLD;

  const { stop } = useIntersectionObserver(
    element,
    ([entry]) => {
      // An element leaving still intersects below the threshold, so the visible share decides.
      const isVisible = !!entry?.isIntersecting && getVisibleShare(entry) >= threshold;

      if (isVisible) {
        element.setAttribute(VISIBLE_ATTRIBUTE, "");
        if (isOnce) {
          stop();
        }
      } else if (!isOnce) {
        element.removeAttribute(VISIBLE_ATTRIBUTE);
      }
    },
    { threshold: [...OBSERVED_SHARES, threshold] },
  );
});

/** Of the element, or of the viewport when the element is taller. */
function getVisibleShare(entry: IntersectionObserverEntry): number {
  const height = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? window.innerHeight);
  return height > 0 ? entry.intersectionRect.height / height : entry.intersectionRatio;
}
