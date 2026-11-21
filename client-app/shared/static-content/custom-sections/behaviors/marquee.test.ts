import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, withDirectives } from "vue";
import { vMarquee } from "./marquee";

const mocks = vi.hoisted(() => ({ motion: "no-preference" }));

vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  usePreferredReducedMotion: () => ({
    get value() {
      return mocks.motion;
    },
  }),
}));

function mountMarquee(direction?: "rtl") {
  return mount(
    defineComponent({
      setup: () => () =>
        h("div", { dir: direction }, [
          withDirectives(
            h("div", { id: "marquee" }, [
              h("span", "A"),
              h("span", { "data-sb-repeat": "", "aria-hidden": "true" }, "A"),
            ]),
            [[vMarquee, ""]],
          ),
        ]),
    }),
    { attachTo: document.body },
  );
}

function stubLayout(element: HTMLElement, animation: object): void {
  const [first, copy] = [...element.children] as HTMLElement[];
  Object.defineProperty(first, "offsetLeft", { value: 0 });
  Object.defineProperty(copy, "offsetLeft", { value: 120 });
  Object.assign(element, { getAnimations: () => [animation] });
}

describe("vMarquee", () => {
  beforeEach(() => {
    mocks.motion = "no-preference";
    document.body.innerHTML = "";
  });

  it.each([
    { direction: undefined, shift: "-120px" },
    { direction: "rtl" as const, shift: "120px" },
  ])("shifts one run toward the inline start: $shift for $direction", ({ direction, shift }) => {
    const animation = { pause: vi.fn(), play: vi.fn() };
    const element = document.createElement("div");
    element.append(document.createElement("span"), document.createElement("span"));
    element.lastElementChild?.setAttribute("data-sb-repeat", "");
    stubLayout(element, animation);
    const host = document.createElement("div");
    if (direction) {
      host.dir = direction;
    }
    host.append(element);
    document.body.append(host);

    vMarquee.mounted?.(element, { value: "" } as never, {} as never, null);

    expect(element.style.getPropertyValue("--marquee-width")).toBe("120px");
    expect(element.style.getPropertyValue("--marquee-shift")).toBe(shift);
    vMarquee.unmounted?.(element, { value: "" } as never, {} as never, null);
  });

  it("pauses while the pointer is over it or the focus inside, and resumes only what it paused", async () => {
    const wrapper = mountMarquee();
    const marquee = wrapper.find("#marquee");
    const running = { playState: "running", pause: vi.fn(), play: vi.fn() };
    const finished = { playState: "finished", pause: vi.fn(), play: vi.fn() };
    stubLayout(marquee.element as HTMLElement, running);
    Object.assign(marquee.element, { getAnimations: () => [running, finished] });

    await marquee.trigger("mouseenter");
    expect(marquee.attributes("data-paused")).toBe("");
    expect(running.pause).toHaveBeenCalledOnce();

    await marquee.trigger("focusin");
    await marquee.trigger("mouseleave");
    expect(marquee.attributes("data-paused")).toBe("");
    expect(running.play).not.toHaveBeenCalled();

    await marquee.trigger("focusout", { relatedTarget: null });
    expect(marquee.attributes("data-paused")).toBeUndefined();
    expect(running.play).toHaveBeenCalledOnce();
    expect(finished.pause).not.toHaveBeenCalled();
    expect(finished.play).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("stands still with reduced motion", () => {
    mocks.motion = "reduce";

    const wrapper = mountMarquee();
    const element = wrapper.find("#marquee").element as HTMLElement;

    expect(element.style.getPropertyValue("--marquee-shift")).toBe("0px");
    expect(element.style.getPropertyValue("--marquee-width")).toBe("0px");
    wrapper.unmount();
  });
});
