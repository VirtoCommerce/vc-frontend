import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, withDirectives } from "vue";
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
  [first, copy].forEach((item) => Object.assign(item, { getClientRects: () => [{}] }));
  Object.defineProperty(first, "offsetLeft", { value: 0 });
  Object.defineProperty(copy, "offsetLeft", { value: 120 });
  Object.assign(element, { getAnimations: () => [animation] });
}

describe("vMarquee", () => {
  beforeEach(() => {
    mocks.motion = "no-preference";
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

  it("measures from the first item that has a box, as when the section's CSS hides the first", () => {
    const element = document.createElement("div");
    const [hidden, shown, hiddenCopy, shownCopy] = ["a", "b", "a", "b"].map(() => document.createElement("span"));
    hiddenCopy.setAttribute("data-sb-repeat", "");
    shownCopy.setAttribute("data-sb-repeat", "");
    element.append(hidden, shown, hiddenCopy, shownCopy);
    document.body.append(element);
    [hidden, hiddenCopy].forEach((item) => Object.assign(item, { getClientRects: () => [] }));
    [shown, shownCopy].forEach((item) => Object.assign(item, { getClientRects: () => [{}] }));
    Object.defineProperty(shown, "offsetLeft", { value: 10 });
    Object.defineProperty(shownCopy, "offsetLeft", { value: 130 });

    vMarquee.mounted?.(element, { value: "" } as never, {} as never, null);

    expect(element.style.getPropertyValue("--marquee-width")).toBe("120px");
    vMarquee.unmounted?.(element, { value: "" } as never, {} as never, null);
  });

  it("shifts the other way when a setting turns the direction, without a remount", async () => {
    const direction = ref("ltr");
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          withDirectives(
            h("div", { dir: direction.value }, [h("span", "A"), h("span", { "data-sb-repeat": "" }, "A")]),
            [[vMarquee, ""]],
          ),
      }),
      { attachTo: document.body },
    );
    const element = wrapper.element as HTMLElement;
    stubLayout(element, {});

    direction.value = "rtl";
    await nextTick();

    expect(element.style.getPropertyValue("--marquee-shift")).toBe("120px");
    wrapper.unmount();
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

  it("measures again when an item of the track resizes, an item added later included, with one observer", async () => {
    const observers: { targets: Element[]; isConnected: boolean; callback: () => void }[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        targets: Element[] = [];
        isConnected = true;

        constructor(readonly callback: () => void) {
          observers.push(this);
        }

        observe(target: Element): void {
          this.targets.push(target);
        }

        disconnect(): void {
          this.isConnected = false;
        }
      },
    );
    const items = ref(["A"]);
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          withDirectives(
            h("div", { id: "marquee" }, [
              ...items.value.map((item) => h("span", item)),
              ...items.value.map((item) => h("span", { "data-sb-repeat": "" }, item)),
            ]),
            [[vMarquee, ""]],
          ),
      }),
    );
    const element = wrapper.element;
    await nextTick();

    items.value = ["A", "B"];
    await nextTick();
    await nextTick();
    const connected = observers.filter(({ isConnected }) => isConnected);

    expect(connected).toHaveLength(1);
    expect(connected[0].targets).toEqual([element, ...element.children]);

    const [first, , firstCopy] = [...element.children] as HTMLElement[];
    [first, firstCopy].forEach((item) => Object.assign(item, { getClientRects: () => [{}] }));
    Object.defineProperty(firstCopy, "offsetLeft", { value: 180 });
    connected[0].callback();

    expect((element as HTMLElement).style.getPropertyValue("--marquee-width")).toBe("180px");
    wrapper.unmount();
  });

  it.each([
    { content: "text", children: [h("span", "Sale"), h("span", { "data-sb-repeat": "" }, "Sale")], tabindex: "0" },
    {
      content: "a link",
      children: [h("a", { href: "/sale" }, "Sale"), h("a", { href: "/sale", "data-sb-repeat": "" }, "Sale")],
      tabindex: undefined,
    },
  ])(
    "lets the keyboard reach a marquee of $content, so focus can pause it: tabindex $tabindex",
    ({ children, tabindex }) => {
      const wrapper = mount(
        defineComponent({ setup: () => () => withDirectives(h("div", children), [[vMarquee, ""]]) }),
      );

      expect(wrapper.attributes("tabindex")).toBe(tabindex);
      wrapper.unmount();
    },
  );

  it.each([
    { content: "a disabled button", item: { tag: "button", props: { disabled: true } }, tabindex: "0" },
    {
      content: "a link out of the tab order",
      item: { tag: "a", props: { href: "/sale", tabindex: "-1" } },
      tabindex: "0",
    },
    { content: "a video with controls", item: { tag: "video", props: { controls: true } }, tabindex: undefined },
  ])("lets the keyboard reach the strip by what its run holds, $content: tabindex $tabindex", ({ item, tabindex }) => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          withDirectives(h("div", [h(item.tag, item.props), h(item.tag, { ...item.props, "data-sb-repeat": "" })]), [
            [vMarquee, ""],
          ]),
      }),
    );

    expect(wrapper.attributes("tabindex")).toBe(tabindex);
    wrapper.unmount();
  });

  it("gives the tab stop to an item that becomes focusable later, as one whose behavior loads after it", async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          withDirectives(h("div", [h("span", "CODE10"), h("span", { "data-sb-repeat": "" }, "CODE10")]), [
            [vMarquee, ""],
          ]),
      }),
    );
    const [item] = wrapper.element.children;

    item.setAttribute("tabindex", "0");
    await vi.waitFor(() => expect(wrapper.attributes("tabindex")).toBeUndefined());

    item.removeAttribute("tabindex");
    await vi.waitFor(() => expect(wrapper.attributes("tabindex")).toBe("0"));
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
