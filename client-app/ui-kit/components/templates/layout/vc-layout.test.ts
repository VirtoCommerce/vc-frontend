import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import VcLayout from "./vc-layout.vue";

const createWrapper = createWrapperFactory(mount, VcLayout, {
  slots: { default: "<p>content</p>", sidebar: "<p>sidebar</p>" },
});

const positionOf = (wrapper: ReturnType<typeof createWrapper>, id: "sidebar" | "content") =>
  (wrapper.get(`[data-test-id="${id}"]`).element as HTMLElement).style.position;

const settle = async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 100));
};

let printMatches = false;

enableAutoUnmount(afterEach);

describe("VcLayout print", () => {
  beforeEach(() => {
    printMatches = false;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query === "print" && printMatches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sticks the sidebar on screen", async () => {
    const wrapper = createWrapper({ props: { sticky: true } });
    await settle();

    expect(positionOf(wrapper, "sidebar")).toBe("sticky");
  });

  it("resets to static on beforeprint", async () => {
    const wrapper = createWrapper({ props: { sticky: true } });
    await settle();

    window.dispatchEvent(new Event("beforeprint"));
    await nextTick();

    expect(positionOf(wrapper, "sidebar")).toBe("static");
  });

  it("sticks the shorter content block, resets on beforeprint and restores on afterprint", async () => {
    const heights = { sidebar: 600, content: 300 };
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const height = heights[this.dataset.testId as keyof typeof heights] ?? 0;
      return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: height, width: 0, height, toJSON: () => ({}) };
    });
    const wrapper = createWrapper({ props: { sticky: true } });
    await settle();

    expect(positionOf(wrapper, "content")).toBe("sticky");

    window.dispatchEvent(new Event("beforeprint"));
    await nextTick();

    expect(positionOf(wrapper, "content")).toBe("static");

    window.dispatchEvent(new Event("afterprint"));
    await settle();

    expect(positionOf(wrapper, "content")).toBe("sticky");
  });

  it("sticks again on afterprint", async () => {
    const wrapper = createWrapper({ props: { sticky: true } });
    await settle();
    window.dispatchEvent(new Event("beforeprint"));
    await nextTick();

    expect(positionOf(wrapper, "sidebar")).toBe("static");

    window.dispatchEvent(new Event("afterprint"));
    await settle();

    expect(positionOf(wrapper, "sidebar")).toBe("sticky");
  });

  it("starts static when the print media query matches", async () => {
    printMatches = true;
    const wrapper = createWrapper({ props: { sticky: true } });
    await settle();

    expect(positionOf(wrapper, "sidebar")).toBe("static");
  });

  it("never sticks without the sticky prop", async () => {
    const wrapper = createWrapper({ props: { sticky: false } });
    await settle();

    expect(positionOf(wrapper, "sidebar")).not.toBe("sticky");
  });
});
