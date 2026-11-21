import { useIntersectionObserver } from "@vueuse/core";
import { defineBehavior, readNumberAttribute } from "./define-behavior";

const DEFAULT_THRESHOLD = 0.2;
const VISIBLE_ATTRIBUTE = "data-visible";

/** Sets `data-visible` while the threshold's share of the element is on screen; with `-once` it stays. */
export const vInview = defineBehavior((element, { isReducedMotion }) => {
  if (isReducedMotion) {
    element.setAttribute(VISIBLE_ATTRIBUTE, "");
    return;
  }

  const isOnce = element.hasAttribute("data-inview-once");
  const threshold = readNumberAttribute(element, "data-inview-threshold", 0, 1) ?? DEFAULT_THRESHOLD;

  const { stop } = useIntersectionObserver(
    element,
    ([entry]) => {
      // An element leaving still intersects below the threshold, so the ratio decides.
      const isVisible = !!entry?.isIntersecting && entry.intersectionRatio >= threshold;

      if (isVisible) {
        element.setAttribute(VISIBLE_ATTRIBUTE, "");
        if (isOnce) {
          stop();
        }
      } else if (!isOnce) {
        element.removeAttribute(VISIBLE_ATTRIBUTE);
      }
    },
    { threshold },
  );
});
