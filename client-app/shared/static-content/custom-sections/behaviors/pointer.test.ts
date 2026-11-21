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

function mountTracked(direction?: "rtl") {
  return mount(
    defineComponent({
      setup: () => () => h("div", { dir: direction }, [withDirectives(h("div", { id: "tracked" }), [[vPointer, ""]])]),
    }),
  );
}

function readPointer(wrapper: ReturnType<typeof mountTracked>) {
  const element = wrapper.find("#tracked").element as HTMLElement;
  return ["--pointer-x", "--pointer-y", "--pointer-inline", "--pointer-active"].map((name) =>
    element.style.getPropertyValue(name),
  );
}

async function movePointer(x: number, y: number): Promise<void> {
  const mouse = mocks.mouse;
  if (!mouse) {
    throw new Error("The pointer is not tracked");
  }
  mouse.elementX.value = x;
  mouse.elementY.value = y;
  mouse.isOutside.value = false;
  await nextTick();
}

describe("vPointer", () => {
  beforeEach(() => {
    mocks.motion = "no-preference";
    mocks.isTouchScreen = false;
    mocks.mouse = undefined;
  });

  it("writes where the pointer is inside the element, and whether it is", async () => {
    const wrapper = mountTracked();
    expect(readPointer(wrapper)).toEqual(["0", "0", "0", "0"]);

    await movePointer(50, 75);

    expect(readPointer(wrapper)).toEqual(["0.25", "0.75", "0.25", "1"]);
  });

  it("measures --pointer-inline from the inline start, the right edge in right-to-left text", async () => {
    const wrapper = mountTracked("rtl");

    await movePointer(50, 75);

    expect(readPointer(wrapper)).toEqual(["0.25", "0.75", "0.75", "1"]);
  });

  it.each([
    { case: "on a touch screen", isTouchScreen: true, motion: "no-preference" },
    { case: "with reduced motion", isTouchScreen: false, motion: "reduce" },
  ])("stays centered and inactive $case", ({ isTouchScreen, motion }) => {
    mocks.isTouchScreen = isTouchScreen;
    mocks.motion = motion;

    const wrapper = mountTracked();

    expect(readPointer(wrapper)).toEqual(["0.5", "0.5", "0.5", "0"]);
    expect(mocks.mouse).toBeUndefined();
  });
});
