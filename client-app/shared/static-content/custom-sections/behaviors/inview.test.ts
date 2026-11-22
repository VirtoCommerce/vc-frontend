import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, withDirectives } from "vue";
import { vInview } from "./inview";

type EntryType = Pick<
  IntersectionObserverEntry,
  "isIntersecting" | "intersectionRatio" | "intersectionRect" | "boundingClientRect" | "rootBounds"
>;

const VIEWPORT_HEIGHT = 800;

const mocks = vi.hoisted(() => ({
  motion: "no-preference",
  onIntersect: undefined as ((entries: EntryType[]) => void) | undefined,
  options: undefined as { threshold?: number | number[] } | undefined,
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
    mocks.options = options;
    return { stop: mocks.stop };
  },
}));

/** An element `height` tall, `visibleHeight` of it on screen. */
function toEntry(visibleHeight: number, height = 400): EntryType {
  return {
    isIntersecting: visibleHeight > 0,
    intersectionRatio: visibleHeight / height,
    intersectionRect: { height: visibleHeight } as DOMRectReadOnly,
    boundingClientRect: { height } as DOMRectReadOnly,
    rootBounds: { height: VIEWPORT_HEIGHT } as DOMRectReadOnly,
  };
}

function mountObserved(attributes: Record<string, string> = {}) {
  return mount(defineComponent({ setup: () => () => withDirectives(h("div", attributes), [[vInview, ""]]) }));
}

describe("vInview", () => {
  beforeEach(() => {
    mocks.motion = "no-preference";
    mocks.onIntersect = undefined;
    mocks.options = undefined;
    mocks.stop.mockClear();
  });

  it("sets data-visible while the threshold's share of the element is on screen", () => {
    const wrapper = mountObserved({ "data-inview-threshold": "0.5" });

    mocks.onIntersect?.([toEntry(240)]);
    expect(wrapper.attributes("data-visible")).toBe("");

    mocks.onIntersect?.([toEntry(120)]);
    expect(wrapper.attributes("data-visible")).toBeUndefined();
  });

  it("takes 0.2 for a threshold that is missing", () => {
    const wrapper = mountObserved();

    mocks.onIntersect?.([toEntry(60)]);
    expect(wrapper.attributes("data-visible")).toBeUndefined();

    mocks.onIntersect?.([toEntry(100)]);
    expect(wrapper.attributes("data-visible")).toBe("");
  });

  it("takes the viewport's share for an element taller than the viewport, and hears of it in time", () => {
    const height = 3 * VIEWPORT_HEIGHT;
    const wrapper = mountObserved();
    const thresholds = [mocks.options?.threshold ?? []].flat();

    mocks.onIntersect?.([toEntry(0.15 * VIEWPORT_HEIGHT, height)]);
    expect(wrapper.attributes("data-visible")).toBeUndefined();

    mocks.onIntersect?.([toEntry(0.25 * VIEWPORT_HEIGHT, height)]);
    expect(wrapper.attributes("data-visible")).toBe("");
    expect(thresholds.some((threshold) => threshold > 0.05 && threshold <= (0.2 * VIEWPORT_HEIGHT) / height)).toBe(
      true,
    );
  });

  it("keeps data-visible once set with data-inview-once", () => {
    const wrapper = mountObserved({ "data-inview-once": "" });

    mocks.onIntersect?.([toEntry(400)]);
    mocks.onIntersect?.([toEntry(0)]);

    expect(wrapper.attributes("data-visible")).toBe("");
    expect(mocks.stop).toHaveBeenCalled();
  });

  it("lets data-visible go again when data-inview-once is false", () => {
    const wrapper = mountObserved({ "data-inview-once": "false" });

    mocks.onIntersect?.([toEntry(400)]);
    mocks.onIntersect?.([toEntry(0)]);

    expect(wrapper.attributes("data-visible")).toBeUndefined();
  });

  it("sets data-visible at once with reduced motion", () => {
    mocks.motion = "reduce";

    const wrapper = mountObserved();

    expect(wrapper.attributes("data-visible")).toBe("");
    expect(mocks.onIntersect).toBeUndefined();
  });
});
