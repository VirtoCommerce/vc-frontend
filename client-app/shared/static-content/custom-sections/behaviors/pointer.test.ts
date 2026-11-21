import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, withDirectives } from "vue";
import { vPointer } from "./pointer";

const mocks = vi.hoisted(() => ({
  motion: "no-preference",
  isTouchScreen: false,
  mouse: undefined as
    | Record<"elementX" | "elementY" | "elementWidth" | "elementHeight" | "isOutside", { value: number | boolean }>
    | undefined,
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const { ref: createRef } = await import("vue");

  return {
    ...(await importOriginal<typeof import("@vueuse/core")>()),
    usePreferredReducedMotion: () => ({ value: mocks.motion }),
    useMediaQuery: () => ({ value: mocks.isTouchScreen }),
    useMouseInElement: () => {
      mocks.mouse = {
        elementX: createRef(0),
        elementY: createRef(0),
        elementWidth: createRef(200),
        elementHeight: createRef(100),
        isOutside: createRef(true),
      };
      return mocks.mouse;
    },
  };
});

function mountTracked() {
  return mount(defineComponent({ setup: () => () => withDirectives(h("div"), [[vPointer, ""]]) }));
}

function readPointer(element: HTMLElement) {
  return ["--pointer-x", "--pointer-y", "--pointer-active"].map((name) => element.style.getPropertyValue(name));
}

describe("vPointer", () => {
  beforeEach(() => {
    mocks.motion = "no-preference";
    mocks.isTouchScreen = false;
    mocks.mouse = undefined;
  });

  it("writes where the pointer is inside the element, and whether it is", async () => {
    const wrapper = mountTracked();
    expect(readPointer(wrapper.element as HTMLElement)).toEqual(["0", "0", "0"]);

    const mouse = mocks.mouse;
    if (!mouse) {
      throw new Error("The pointer is not tracked");
    }
    mouse.elementX.value = 50;
    mouse.elementY.value = 75;
    mouse.isOutside.value = false;
    await nextTick();

    expect(readPointer(wrapper.element as HTMLElement)).toEqual(["0.25", "0.75", "1"]);
  });

  it.each([
    { case: "on a touch screen", isTouchScreen: true, motion: "no-preference" },
    { case: "with reduced motion", isTouchScreen: false, motion: "reduce" },
  ])("stays centered and inactive $case", ({ isTouchScreen, motion }) => {
    mocks.isTouchScreen = isTouchScreen;
    mocks.motion = motion;

    const wrapper = mountTracked();

    expect(readPointer(wrapper.element as HTMLElement)).toEqual(["0.5", "0.5", "0"]);
    expect(mocks.mouse).toBeUndefined();
  });
});
