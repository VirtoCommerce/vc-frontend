import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, withDirectives } from "vue";
import { vInview } from "./inview";

type EntryType = Pick<
  IntersectionObserverEntry,
  "isIntersecting" | "intersectionRatio" | "intersectionRect" | "boundingClientRect" | "rootBounds"
>;

interface IBox {
  width: number;
  height: number;
}

const mocks = vi.hoisted(() => ({
  motion: "no-preference",
  onIntersect: undefined as ((entries: EntryType[]) => void) | undefined,
  thresholds: [] as number[],
  stop: vi.fn(),
}));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  usePreferredReducedMotion: () => ({
    get value() {
      return mocks.motion;
    },
  }),
  useIntersectionObserver: (
    _target: unknown,
    callback: (entries: EntryType[]) => void,
    options: { threshold?: number | number[] },
  ) => {
    mocks.onIntersect = callback;
    mocks.thresholds = [options.threshold ?? []].flat();
    return { stop: mocks.stop };
  },
}));

const VIEWPORT: IBox = { width: window.innerWidth, height: window.innerHeight };

/** An element of `box`, `visible` of it on screen, in a root of `root`; `null` for a root the frame cannot see. */
function toEntry(visible: IBox, box: IBox, root: IBox | null = VIEWPORT): EntryType {
  return {
    isIntersecting: visible.width > 0 && visible.height > 0,
    intersectionRatio: (visible.width * visible.height) / (box.width * box.height),
    intersectionRect: visible as DOMRectReadOnly,
    boundingClientRect: box as DOMRectReadOnly,
    rootBounds: root as DOMRectReadOnly | null,
  };
}

function mountObserved(attributes: Record<string, string> = {}, box: IBox = { width: 400, height: 400 }) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(box as DOMRect);

  return mount(defineComponent({ setup: () => () => withDirectives(h("div", attributes), [[vInview, ""]]) }));
}

enableAutoUnmount(afterEach);

describe("vInview", () => {
  beforeEach(() => {
    mocks.motion = "no-preference";
    mocks.onIntersect = undefined;
    mocks.thresholds = [];
    mocks.stop.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(document.documentElement, "clientWidth");
    Reflect.deleteProperty(document.documentElement, "clientHeight");
  });

  it("sets data-visible while the threshold's share of the element is on screen", () => {
    const box = { width: 400, height: 400 };
    const wrapper = mountObserved({ "data-inview-threshold": "0.5" }, box);

    mocks.onIntersect?.([toEntry({ width: 400, height: 240 }, box)]);
    expect(wrapper.attributes("data-visible")).toBe("");

    mocks.onIntersect?.([toEntry({ width: 400, height: 120 }, box)]);
    expect(wrapper.attributes("data-visible")).toBeUndefined();
  });

  it("takes 0.2 for a threshold that is missing", () => {
    const box = { width: 400, height: 400 };
    const wrapper = mountObserved({}, box);

    mocks.onIntersect?.([toEntry({ width: 400, height: 60 }, box)]);
    expect(wrapper.attributes("data-visible")).toBeUndefined();

    mocks.onIntersect?.([toEntry({ width: 400, height: 100 }, box)]);
    expect(wrapper.attributes("data-visible")).toBe("");
  });

  it("takes the screen's share for an element three screens tall, and hears of it even at a threshold of 1", () => {
    const box = { width: 400, height: 3 * VIEWPORT.height };
    const wrapper = mountObserved({ "data-inview-threshold": "1" }, box);

    expect(mocks.thresholds.some((threshold) => Math.abs(threshold - 1 / 3) < 1e-3)).toBe(true);

    mocks.onIntersect?.([toEntry({ width: 400, height: 0.99 * VIEWPORT.height }, box)]);
    expect(wrapper.attributes("data-visible")).toBeUndefined();

    mocks.onIntersect?.([toEntry({ width: 400, height: VIEWPORT.height }, box)]);
    expect(wrapper.attributes("data-visible")).toBe("");
  });

  it("listens just below an element's largest ratio, so a threshold of 1 on a tall element is reached", () => {
    mountObserved({ "data-inview-threshold": "1" }, { width: 400, height: 3 * VIEWPORT.height });

    const [, observed] = mocks.thresholds;
    expect(observed).toBeLessThan(1 / 3);
    expect(observed).toBeGreaterThan(0.33);
  });

  it("measures the screen as the observer's root does, without the scrollbar", () => {
    const rootWidth = VIEWPORT.width - 15;
    Object.defineProperty(document.documentElement, "clientWidth", { value: rootWidth, configurable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: VIEWPORT.height, configurable: true });

    mountObserved({ "data-inview-threshold": "0.99" }, { width: VIEWPORT.width, height: 400 });

    const [, observed] = mocks.thresholds;
    expect(observed).toBeLessThan(rootWidth / VIEWPORT.width);
  });

  it("counts both axes, so a card mostly beside the screen in a scrolled row stays hidden", () => {
    const box = { width: 400, height: 400 };
    const wrapper = mountObserved({}, box);

    mocks.onIntersect?.([toEntry({ width: 40, height: 400 }, box)]);
    expect(wrapper.attributes("data-visible")).toBeUndefined();

    mocks.onIntersect?.([toEntry({ width: 100, height: 400 }, box)]);
    expect(wrapper.attributes("data-visible")).toBe("");
  });

  it("reads the window's size when the root's is unknown, as in a frame of another origin", () => {
    const box = { width: 400, height: 2 * VIEWPORT.height };
    const wrapper = mountObserved({}, box);

    mocks.onIntersect?.([toEntry({ width: 400, height: 0.25 * VIEWPORT.height }, box, null)]);

    expect(wrapper.attributes("data-visible")).toBe("");
  });

  it("keeps data-visible once set with data-inview-once", () => {
    const box = { width: 400, height: 400 };
    const wrapper = mountObserved({ "data-inview-once": "" }, box);

    mocks.onIntersect?.([toEntry(box, box)]);
    mocks.onIntersect?.([toEntry({ width: 0, height: 0 }, box)]);

    expect(wrapper.attributes("data-visible")).toBe("");
    expect(mocks.stop).toHaveBeenCalled();
  });

  it("lets data-visible go again when data-inview-once is false", () => {
    const box = { width: 400, height: 400 };
    const wrapper = mountObserved({ "data-inview-once": "false" }, box);

    mocks.onIntersect?.([toEntry(box, box)]);
    expect(wrapper.attributes("data-visible")).toBe("");

    mocks.onIntersect?.([toEntry({ width: 0, height: 0 }, box)]);
    expect(wrapper.attributes("data-visible")).toBeUndefined();
  });

  it("sets data-visible at once with reduced motion", () => {
    mocks.motion = "reduce";

    const wrapper = mountObserved();

    expect(wrapper.attributes("data-visible")).toBe("");
    expect(mocks.onIntersect).toBeUndefined();
  });
});
