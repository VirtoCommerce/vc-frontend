import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, withDirectives } from "vue";
import { vPointer } from "./pointer";

const mocks = vi.hoisted(() => ({ motion: "no-preference", isTouchScreen: false }));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  usePreferredReducedMotion: () => ({
    get value() {
      return mocks.motion;
    },
  }),
  useMediaQuery: () => ({
    get value() {
      return mocks.isTouchScreen;
    },
  }),
}));

function mountTracked(direction?: "rtl") {
  return mount(
    defineComponent({
      setup: () => () => h("div", { dir: direction }, [withDirectives(h("div", { id: "tracked" }), [[vPointer, ""]])]),
    }),
    { attachTo: document.body },
  );
}

function getTracked(wrapper: ReturnType<typeof mountTracked>): HTMLElement {
  const element = wrapper.find("#tracked").element as HTMLElement;
  element.getBoundingClientRect = () => ({ left: 100, top: 50, width: 200, height: 100 }) as DOMRect;
  return element;
}

function readPointer(element: HTMLElement): string[] {
  return ["--pointer-x", "--pointer-y", "--pointer-inline", "--pointer-active"].map((name) =>
    element.style.getPropertyValue(name),
  );
}

function mountWithDirection() {
  const direction = ref("ltr");
  const wrapper = mount(
    defineComponent({
      setup: () => () => withDirectives(h("div", { id: "tracked", dir: direction.value }), [[vPointer, ""]]),
    }),
    { attachTo: document.body },
  );

  return { element: getTracked(wrapper), direction };
}

describe("vPointer", () => {
  beforeEach(() => {
    mocks.motion = "no-preference";
    mocks.isTouchScreen = false;
    document.body.innerHTML = "";
  });

  it("writes where the pointer is inside the element while it is, from the element's own events", () => {
    const element = getTracked(mountTracked());
    expect(readPointer(element)).toEqual(["0.5", "0.5", "0.5", "0"]);

    element.dispatchEvent(new MouseEvent("pointermove", { clientX: 150, clientY: 125 }));
    expect(readPointer(element)).toEqual(["0.25", "0.75", "0.25", "1"]);

    element.dispatchEvent(new MouseEvent("pointerleave"));
    expect(readPointer(element)).toEqual(["0.25", "0.75", "0.25", "0"]);
  });

  it("does not follow the pointer elsewhere on the page", () => {
    const element = getTracked(mountTracked());

    document.dispatchEvent(new MouseEvent("pointermove", { clientX: 150, clientY: 125 }));

    expect(readPointer(element)).toEqual(["0.5", "0.5", "0.5", "0"]);
  });

  it("measures --pointer-inline from the inline start, the right edge in right-to-left text", () => {
    const element = getTracked(mountTracked("rtl"));

    element.dispatchEvent(new MouseEvent("pointermove", { clientX: 150, clientY: 125 }));

    expect(readPointer(element)).toEqual(["0.25", "0.75", "0.75", "1"]);
  });

  it.each([
    { case: "on a touch screen", isTouchScreen: true, motion: "no-preference" },
    { case: "with reduced motion", isTouchScreen: false, motion: "reduce" },
  ])("stays centered and inactive $case", ({ isTouchScreen, motion }) => {
    mocks.isTouchScreen = isTouchScreen;
    mocks.motion = motion;
    const element = getTracked(mountTracked());

    element.dispatchEvent(new MouseEvent("pointermove", { clientX: 150, clientY: 125 }));

    expect(readPointer(element)).toEqual(["0.5", "0.5", "0.5", "0"]);
  });

  it("follows a direction a setting changes, without a remount", async () => {
    const { element, direction } = mountWithDirection();

    direction.value = "rtl";
    await nextTick();
    element.dispatchEvent(new MouseEvent("pointermove", { clientX: 150, clientY: 125 }));

    expect(element.style.getPropertyValue("--pointer-inline")).toBe("0.75");
  });
});
