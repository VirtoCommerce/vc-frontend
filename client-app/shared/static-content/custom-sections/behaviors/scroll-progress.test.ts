import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, withDirectives } from "vue";
import { vScrollProgress } from "./scroll-progress";

type IntersectCallbackType = (entries: { isIntersecting: boolean }[]) => void;

const mocks = vi.hoisted(() => ({
  motion: "no-preference",
  onIntersect: undefined as IntersectCallbackType | undefined,
  onIntersectAll: [] as IntersectCallbackType[],
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
    mocks.onIntersectAll.push(callback);
    return { stop: vi.fn() };
  },
}));

function mountTracked(options: { attachTo?: HTMLElement } = {}) {
  const wrapper = mount(
    defineComponent({ setup: () => () => withDirectives(h("div"), [[vScrollProgress, ""]]) }),
    options,
  );
  const element = wrapper.element as HTMLElement;
  let top = 500;
  element.getBoundingClientRect = vi.fn(() => ({ top, height: 200 }) as DOMRect);

  return { element, moveTo: (value: number) => (top = value) };
}

enableAutoUnmount(afterEach);

describe("vScrollProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    vi.stubGlobal("innerHeight", 1000);
    mocks.motion = "no-preference";
    mocks.onIntersect = undefined;
    mocks.onIntersectAll = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
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

  it("follows a scroll inside a scroller of the page, which never bubbles to the window", () => {
    const scroller = document.createElement("div");
    document.body.append(scroller);
    const { element, moveTo } = mountTracked({ attachTo: scroller });
    mocks.onIntersect?.([{ isIntersecting: true }]);
    vi.advanceTimersToNextFrame();

    moveTo(-100);
    scroller.dispatchEvent(new Event("scroll"));
    vi.advanceTimersToNextFrame();

    expect(element.style.getPropertyValue("--scroll-progress")).toBe("0.917");
  });

  it("reads every element's layout before it writes any, in one frame", () => {
    const steps: string[] = [];
    const elements = ["a", "b"].map((name) => {
      const { element } = mountTracked();
      const read = element.getBoundingClientRect;
      const write = element.style.setProperty.bind(element.style);
      element.getBoundingClientRect = vi.fn(() => {
        steps.push(`read ${name}`);
        return read();
      });
      element.style.setProperty = (property: string, value: string | null) => {
        steps.push(`write ${name}`);
        write(property, value);
      };

      return element;
    });
    const requestFrame = vi.spyOn(window, "requestAnimationFrame");

    mocks.onIntersectAll.forEach((callback) => callback([{ isIntersecting: true }]));
    vi.advanceTimersToNextFrame();

    expect(requestFrame).toHaveBeenCalledOnce();
    expect(steps).toEqual(["read a", "read b", "write a", "write b"]);
    expect(elements.map((element) => element.style.getPropertyValue("--scroll-progress"))).toEqual(["0.417", "0.417"]);
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
