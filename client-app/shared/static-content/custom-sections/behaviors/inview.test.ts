import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, withDirectives } from "vue";
import { vInview } from "./inview";

type EntryType = { isIntersecting: boolean; intersectionRatio: number };

const mocks = vi.hoisted(() => ({
  motion: "no-preference",
  onIntersect: undefined as ((entries: EntryType[]) => void) | undefined,
  options: undefined as { threshold?: number } | undefined,
  stop: vi.fn(),
}));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  usePreferredReducedMotion: () => ({ value: mocks.motion }),
  useIntersectionObserver: (
    _target: unknown,
    callback: (entries: EntryType[]) => void,
    options: { threshold?: number },
  ) => {
    mocks.onIntersect = callback;
    mocks.options = options;
    return { stop: mocks.stop };
  },
}));

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
    expect(mocks.options?.threshold).toBeCloseTo(0.5);

    mocks.onIntersect?.([{ isIntersecting: true, intersectionRatio: 0.6 }]);
    expect(wrapper.attributes("data-visible")).toBe("");

    mocks.onIntersect?.([{ isIntersecting: true, intersectionRatio: 0.3 }]);
    expect(wrapper.attributes("data-visible")).toBeUndefined();
  });

  it("takes 0.2 for a threshold that is missing", () => {
    mountObserved();

    expect(mocks.options?.threshold).toBeCloseTo(0.2);
  });

  it("keeps data-visible once set with data-inview-once", () => {
    const wrapper = mountObserved({ "data-inview-once": "" });

    mocks.onIntersect?.([{ isIntersecting: true, intersectionRatio: 1 }]);
    mocks.onIntersect?.([{ isIntersecting: false, intersectionRatio: 0 }]);

    expect(wrapper.attributes("data-visible")).toBe("");
    expect(mocks.stop).toHaveBeenCalled();
  });

  it("sets data-visible at once with reduced motion", () => {
    mocks.motion = "reduce";

    const wrapper = mountObserved();

    expect(wrapper.attributes("data-visible")).toBe("");
    expect(mocks.onIntersect).toBeUndefined();
  });
});
