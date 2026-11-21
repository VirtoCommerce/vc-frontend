import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, withDirectives } from "vue";
import { vScrollProgress } from "./scroll-progress";

const mocks = vi.hoisted(() => ({
  motion: "no-preference",
  onIntersect: undefined as ((entries: { isIntersecting: boolean }[]) => void) | undefined,
}));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  usePreferredReducedMotion: () => ({
    get value() {
      return mocks.motion;
    },
  }),
  useIntersectionObserver: (_target: unknown, callback: (entries: { isIntersecting: boolean }[]) => void) => {
    mocks.onIntersect = callback;
    return { stop: vi.fn() };
  },
}));

function mountTracked() {
  const wrapper = mount(defineComponent({ setup: () => () => withDirectives(h("div"), [[vScrollProgress, ""]]) }));
  const element = wrapper.element as HTMLElement;
  let top = 500;
  element.getBoundingClientRect = vi.fn(() => ({ top, height: 200 }) as DOMRect);

  return { element, moveTo: (value: number) => (top = value) };
}

describe("vScrollProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    vi.stubGlobal("innerHeight", 1000);
    mocks.motion = "no-preference";
    mocks.onIntersect = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("writes how far the element has crossed the viewport, once a frame while it is on screen", () => {
    const { element, moveTo } = mountTracked();

    mocks.onIntersect?.([{ isIntersecting: true }]);
    vi.advanceTimersToNextFrame();
    expect(element.style.getPropertyValue("--scroll-progress")).toBe("0.417");

    moveTo(-100);
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    vi.advanceTimersToNextFrame();
    expect(element.style.getPropertyValue("--scroll-progress")).toBe("0.917");
    expect(element.getBoundingClientRect).toHaveBeenCalledTimes(2);
  });

  it("reads no layout while the element is off screen", () => {
    const { element } = mountTracked();
    mocks.onIntersect?.([{ isIntersecting: false }]);
    vi.advanceTimersToNextFrame();
    const reads = vi.mocked(element.getBoundingClientRect).mock.calls.length;

    window.dispatchEvent(new Event("scroll"));
    vi.advanceTimersToNextFrame();

    expect(element.getBoundingClientRect).toHaveBeenCalledTimes(reads);
  });

  it("stands at 1 with reduced motion", () => {
    mocks.motion = "reduce";

    const { element } = mountTracked();

    expect(element.style.getPropertyValue("--scroll-progress")).toBe("1");
  });
});
