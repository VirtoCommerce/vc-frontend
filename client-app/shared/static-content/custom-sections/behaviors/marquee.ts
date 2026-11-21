import { useResizeObserver } from "@vueuse/core";
import { REPEATED_COPY_ATTRIBUTE } from "./constants";
import { defineBehavior } from "./define-behavior";

const VARIABLE = "--marquee-width";

/**
 * The renderer repeats the children once, the copies marked with `data-sb-repeat`;
 * `--marquee-width` is the width of one run, gap included. With reduced motion it is 0, so the loop stands still.
 */
export const vMarquee = defineBehavior((element, { isReducedMotion }) => {
  if (isReducedMotion) {
    element.style.setProperty(VARIABLE, "0px");
    return;
  }

  function measure(): void {
    const first = element.firstElementChild;
    const firstCopy = element.querySelector(`:scope > [${REPEATED_COPY_ATTRIBUTE}]`);
    const width =
      first instanceof HTMLElement && firstCopy instanceof HTMLElement
        ? Math.abs(firstCopy.offsetLeft - first.offsetLeft)
        : element.scrollWidth / 2;

    element.style.setProperty(VARIABLE, `${width}px`);
  }

  measure();
  useResizeObserver(element, measure);
});
