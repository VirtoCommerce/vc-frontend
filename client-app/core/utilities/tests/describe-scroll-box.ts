type ScrollBoxType = {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
  clientWidth?: number;
  scrollWidth?: number;
};

/**
 * jsdom has no layout, so a scroll region's geometry has to be described by hand — and nothing
 * stops the numbers being ones no browser could produce. `scrollHeight` is clamped to at least
 * `clientHeight`, so content that fits reports them EQUAL; a smaller `scrollHeight` is unreachable
 * in a real browser and once let a wrong geometry fix pass ten green tests.
 *
 * Both axes are guarded, including the width this helper supplies by default — a guard written for
 * one axis invents an impossible box on the other.
 */
export function describeScrollBox(element: HTMLElement, box: ScrollBoxType): void {
  const clientWidth = box.clientWidth ?? 300;
  const scrollWidth = box.scrollWidth ?? clientWidth;

  if (box.scrollHeight < box.clientHeight) {
    throw new Error(`impossible box: scrollHeight ${box.scrollHeight} < clientHeight ${box.clientHeight}`);
  }

  if (scrollWidth < clientWidth) {
    throw new Error(`impossible box: scrollWidth ${scrollWidth} < clientWidth ${clientWidth}`);
  }

  Object.defineProperty(element, "clientWidth", { value: clientWidth, configurable: true });
  Object.defineProperty(element, "scrollWidth", { value: scrollWidth, configurable: true });

  Object.defineProperty(element, "clientHeight", { value: box.clientHeight, configurable: true });
  Object.defineProperty(element, "scrollHeight", { value: box.scrollHeight, configurable: true });
  Object.defineProperty(element, "scrollTop", { value: box.scrollTop, writable: true, configurable: true });
}
