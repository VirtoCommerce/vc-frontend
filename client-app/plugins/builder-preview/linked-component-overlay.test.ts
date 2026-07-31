import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LINKED_COMPONENT_END_ANCHOR_ID,
  LinkedComponentOverlay,
  getBoundaryAnchorIds,
  normalizeLinkedComponentBoundaries,
} from "./linked-component-overlay";
import type { ILinkedComponentBoundary } from "./linked-component-overlay";

const boundary: ILinkedComponentBoundary = {
  placementId: "componentRef1",
  componentRef: "component-1",
  startIndex: 1,
  count: 2,
};

let animationFrames: Map<number, FrameRequestCallback>;
let nextAnimationFrameId: number;
let resizeObserver: ResizeObserverMock;
let createdOverlays: LinkedComponentOverlay[];
let originalScrollY: PropertyDescriptor | undefined;
let originalInnerHeight: PropertyDescriptor | undefined;
let originalBodyScrollHeight: PropertyDescriptor | undefined;

class ResizeObserverMock {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();

  constructor(readonly callback: ResizeObserverCallback) {
    recordResizeObserver(this);
  }
}

beforeEach(() => {
  document.body.replaceChildren();
  originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");
  originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
  originalBodyScrollHeight = Object.getOwnPropertyDescriptor(document.body, "scrollHeight");
  animationFrames = new Map();
  nextAnimationFrameId = 1;
  createdOverlays = [];

  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback): number => {
    const id = nextAnimationFrameId++;
    animationFrames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number): void => {
    animationFrames.delete(id);
  });
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.spyOn(window, "scroll").mockImplementation(() => undefined);
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1000 });
});

afterEach(() => {
  createdOverlays.forEach((overlay) => overlay.dispose());
  animationFrames.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  restoreOwnProperty(window, "scrollY", originalScrollY);
  restoreOwnProperty(window, "innerHeight", originalInnerHeight);
  restoreOwnProperty(document.body, "scrollHeight", originalBodyScrollHeight);
  document.body.replaceChildren();
});

describe("linked component preview overlay", () => {
  it("accepts only complete, non-empty boundary records", () => {
    expect(
      normalizeLinkedComponentBoundaries([
        { ...boundary, label: "  Shared · Used on 1 page  " },
        { ...boundary, placementId: "", startIndex: 0 },
        { ...boundary, count: 0 },
        null,
      ]),
    ).toEqual([{ ...boundary, label: "Shared · Used on 1 page" }]);
  });

  it("maps a multi-section boundary to its first and following anchors", () => {
    expect(getBoundaryAnchorIds(["before", "first", "second", "after"], boundary)).toEqual({
      startId: "first",
      endId: "after",
    });
  });

  it("rejects a boundary outside the rendered template", () => {
    expect(getBoundaryAnchorIds(["before", "first"], boundary)).toEqual({});
  });

  it("uses the preview content end anchor for a component at the end of the page", () => {
    expect(getBoundaryAnchorIds(["before", "first", "second"], boundary)).toEqual({
      startId: "first",
      endId: LINKED_COMPONENT_END_ANCHOR_ID,
    });
  });

  it("renders a permanent boundary and uses the terminal sentinel instead of the document footer", () => {
    appendAnchor("first", 100);
    appendAnchor(LINKED_COMPONENT_END_ANCHOR_ID, 350);
    Object.defineProperty(document.body, "scrollHeight", { configurable: true, value: 1200 });

    const { overlay } = createOverlay();
    overlay.update(
      ["before", "first", "second"],
      [{ ...boundary, label: "Shared · Used on 4 pages <script>alert(1)</script>" }],
    );
    flushAnimationFrames();

    const layer = document.querySelector<HTMLElement>("[data-linked-component-overlay]");
    const rendered = document.querySelector<HTMLElement>("[data-linked-component-placement='componentRef1']");
    expect(layer?.getAttribute("aria-hidden")).toBe("true");
    expect(rendered?.style.top).toBe("100px");
    expect(rendered?.style.height).toBe("250px");
    expect(rendered?.style.borderColor).toBe("var(--color-success-600)");
    expect(rendered?.textContent).toBe("Shared · Used on 4 pages <script>alert(1)</script>");
    expect(rendered?.querySelector("script")).toBeNull();
  });

  it("renders only the boundary when the designer omits the optional label", () => {
    appendAnchor("first", 100);
    appendAnchor("after", 300);

    const { overlay } = createOverlay();
    overlay.update(["before", "first", "second", "after"], [boundary]);
    flushAnimationFrames();

    const rendered = document.querySelector<HTMLElement>("[data-linked-component-placement='componentRef1']");
    expect(rendered).not.toBeNull();
    expect(rendered?.querySelector("span")).toBeNull();
  });

  it("synchronizes local hover/null, click selection, and remote highlight", () => {
    appendAnchor("first", 100);
    appendAnchor("after", 300);
    const onHover = vi.fn();
    const onSelect = vi.fn();
    const { blocker, overlay } = createOverlay(onSelect, onHover);
    overlay.update(["before", "first", "second", "after"], [boundary]);
    flushAnimationFrames();

    const rendered = document.querySelector<HTMLElement>("[data-linked-component-placement='componentRef1']")!;
    const getRenderedRect = vi.fn(() => rect(0, 100, 500, 200));
    rendered.getBoundingClientRect = getRenderedRect;

    blocker.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 150 }));
    blocker.dispatchEvent(new MouseEvent("mousemove", { clientX: 60, clientY: 160 }));
    expect(getRenderedRect).not.toHaveBeenCalled();
    flushAnimationFrames();
    expect(getRenderedRect).toHaveBeenCalledOnce();
    expect(onHover).toHaveBeenLastCalledWith("componentRef1");
    expect(rendered.style.borderColor).toBe("var(--color-success-800)");

    blocker.dispatchEvent(new MouseEvent("click", { clientX: 50, clientY: 150 }));
    expect(onSelect).toHaveBeenCalledWith("componentRef1");

    blocker.dispatchEvent(new MouseEvent("mousemove", { clientX: 700, clientY: 700 }));
    flushAnimationFrames();
    expect(onHover).toHaveBeenLastCalledWith(null);
    expect(rendered.style.borderColor).toBe("var(--color-success-600)");

    overlay.highlight("componentRef1");
    expect(rendered.style.boxShadow).toContain("var(--color-success-100)");
    overlay.highlight(null);
    expect(rendered.style.boxShadow).toBe("none");
  });

  it("clears hover when a boundary disappears and when the overlay is disposed", () => {
    appendAnchor("first", 100);
    appendAnchor("after", 300);
    const onHover = vi.fn();
    const { blocker, overlay } = createOverlay(vi.fn(), onHover);
    overlay.update(["before", "first", "second", "after"], [boundary]);
    flushAnimationFrames();

    const rendered = document.querySelector<HTMLElement>("[data-linked-component-placement='componentRef1']")!;
    rendered.getBoundingClientRect = vi.fn(() => rect(0, 100, 500, 200));
    blocker.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 150 }));
    overlay.update([], []);
    flushAnimationFrames();
    expect(onHover).not.toHaveBeenCalled();

    overlay.highlight("componentRef1");
    overlay.update([], []);
    expect(onHover).toHaveBeenLastCalledWith(null);

    overlay.highlight("componentRef1");
    overlay.dispose();
    expect(onHover).toHaveBeenLastCalledWith(null);
    expect(onHover).toHaveBeenCalledTimes(2);
  });

  it("keeps an early selection pending and scrolls to the first child after DOM render", () => {
    const { overlay } = createOverlay();
    expect(overlay.scrollToPlacement("componentRef1")).toBe(false);

    appendAnchor("first", 420);
    appendAnchor("after", 620);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 30 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 200 });
    overlay.update(["before", "first", "second", "after"], [boundary]);
    flushAnimationFrames();

    expect(window.scroll).toHaveBeenCalledWith({ top: 430, behavior: "smooth" });
  });

  it("rerenders on resize and removes observers and event listeners on dispose", () => {
    appendAnchor("first", 100);
    appendAnchor("after", 300);
    const onSelect = vi.fn();
    const { blocker, overlay } = createOverlay(onSelect);
    overlay.update(["before", "first", "second", "after"], [boundary]);
    flushAnimationFrames();
    const firstBoundary = document.querySelector("[data-linked-component-placement='componentRef1']");

    window.dispatchEvent(new Event("resize"));
    flushAnimationFrames();
    const rerenderedBoundary = document.querySelector<HTMLElement>("[data-linked-component-placement='componentRef1']");
    expect(rerenderedBoundary).not.toBe(firstBoundary);
    expect(resizeObserver.observe).toHaveBeenCalledWith(document.body);
    rerenderedBoundary!.getBoundingClientRect = vi.fn(() => rect(0, 100, 500, 200));

    overlay.dispose();
    expect(resizeObserver.disconnect).toHaveBeenCalledOnce();
    expect(document.querySelector("[data-linked-component-overlay]")).toBeNull();

    const scheduledBeforeEvents = nextAnimationFrameId;
    window.dispatchEvent(new Event("resize"));
    blocker.dispatchEvent(new MouseEvent("click", { clientX: 50, clientY: 150 }));
    expect(nextAnimationFrameId).toBe(scheduledBeforeEvents);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

function createOverlay(onSelect = vi.fn(), onHover = vi.fn()) {
  const blocker = document.createElement("div");
  document.body.appendChild(blocker);
  const overlay = new LinkedComponentOverlay(document.body, blocker, onSelect, onHover);
  createdOverlays.push(overlay);
  return {
    blocker,
    overlay,
  };
}

function recordResizeObserver(observer: ResizeObserverMock): void {
  resizeObserver = observer;
}

function appendAnchor(id: string, top: number): HTMLElement {
  const anchor = document.createElement("div");
  anchor.id = `__scroll__${id}`;
  anchor.getBoundingClientRect = vi.fn(() => rect(0, top, 0, 0));
  document.body.appendChild(anchor);
  return anchor;
}

function flushAnimationFrames(): void {
  while (animationFrames.size > 0) {
    const callbacks = [...animationFrames.values()];
    animationFrames.clear();
    callbacks.forEach((callback) => callback(0));
  }
}

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  };
}

function restoreOwnProperty(target: object, key: PropertyKey, descriptor: PropertyDescriptor | undefined): void {
  if (descriptor) {
    Object.defineProperty(target, key, descriptor);
  } else {
    Reflect.deleteProperty(target, key);
  }
}
