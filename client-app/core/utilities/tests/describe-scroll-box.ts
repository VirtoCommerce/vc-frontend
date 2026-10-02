type ScrollBoxType = {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
  clientWidth?: number;
  scrollWidth?: number;
};

/**
 * Hand-written scroll geometry for jsdom, which has no layout. Throws on a box no browser can
 * produce: `scrollHeight`/`scrollWidth` are never below `clientHeight`/`clientWidth`.
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
