import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { VcTabSwitch, VcTabSwitchGroup } from "@/ui-kit/components/molecules";

function createWrapper(initial?: string, disabled: string[] = [], direction?: VcTabSwitchGroupDirectionType) {
  return mount(
    defineComponent({
      components: { VcTabSwitch, VcTabSwitchGroup },
      props: { direction: String },
      setup: () => ({ value: ref(initial), disabled, modes: ["light", "dark", "system"] }),

      template: `
        <VcTabSwitchGroup v-model="value" :direction="direction" aria-label="Color mode">
          <VcTabSwitch
            v-for="mode in modes"
            :key="mode"
            :value="mode"
            :label="mode"
            :disabled="disabled.includes(mode)"
          />
        </VcTabSwitchGroup>
      `,
    }),
    { attachTo: document.body, props: { direction }, global: { stubs: { VcIcon: true } } },
  );
}

function radios(wrapper: ReturnType<typeof createWrapper>) {
  return wrapper.findAll('[role="radio"]');
}

function pill(wrapper: ReturnType<typeof createWrapper>) {
  return wrapper.find('[data-test-id="vc-tab-switch-group-pill"]');
}

function checkedStates(wrapper: ReturnType<typeof createWrapper>) {
  return radios(wrapper).map((radio) => radio.attributes("aria-checked"));
}

enableAutoUnmount(afterEach);

describe("VcTabSwitchGroup", () => {
  it("renders a radiogroup whose items are radios", () => {
    const wrapper = createWrapper("dark");

    expect(wrapper.findComponent(VcTabSwitchGroup).attributes("role")).toBe("radiogroup");
    expect(checkedStates(wrapper)).toEqual(["false", "true", "false"]);
  });

  it("selects the clicked item and updates the model", async () => {
    const wrapper = createWrapper("light");

    await radios(wrapper)[2].trigger("click");

    expect(checkedStates(wrapper)).toEqual(["false", "false", "true"]);
    expect(wrapper.findComponent(VcTabSwitchGroup).emitted("change")).toEqual([["system"]]);
  });

  it("gives the group one tab stop: the checked item", async () => {
    const wrapper = createWrapper("dark");
    await nextTick();

    expect(radios(wrapper).map((radio) => radio.attributes("tabindex"))).toEqual(["-1", "0", "-1"]);
  });

  it("keeps every item reachable while nothing is selected", () => {
    const wrapper = createWrapper();

    expect(radios(wrapper).map((radio) => radio.attributes("tabindex"))).toEqual(["0", "0", "0"]);
  });

  it("keeps every item reachable while the value matches no item", async () => {
    const wrapper = createWrapper("sepia");
    await nextTick();

    expect(radios(wrapper).map((radio) => radio.attributes("tabindex"))).toEqual(["0", "0", "0"]);
  });

  it("keeps the enabled items reachable while the checked item is disabled", () => {
    const wrapper = createWrapper("dark", ["dark"]);

    expect(radios(wrapper).map((radio) => radio.attributes("tabindex"))).toEqual(["0", "-1", "0"]);
  });

  it("takes a disabled item out of the tab order and does not select it", async () => {
    const wrapper = createWrapper(undefined, ["dark"]);

    expect(radios(wrapper)[1].attributes("tabindex")).toBe("-1");

    await radios(wrapper)[1].trigger("click");

    expect(checkedStates(wrapper)).toEqual(["false", "false", "false"]);
    expect(wrapper.findComponent(VcTabSwitchGroup).emitted("change")).toBeUndefined();
  });

  it("gives every radio the same name", () => {
    const names = createWrapper("light")
      .findAll('input[type="radio"]')
      .map((input) => input.attributes("name"));

    expect(names[0]).toBeTruthy();
    expect(new Set(names).size).toBe(1);
  });

  it("states its orientation only when vertical", async () => {
    const wrapper = createWrapper("light");
    const group = wrapper.findComponent(VcTabSwitchGroup);

    expect(group.attributes("aria-orientation")).toBeUndefined();

    await wrapper.setProps({ direction: "vertical" });

    expect(group.attributes("aria-orientation")).toBe("vertical");
  });

  describe("pill", () => {
    // jsdom has no layout and no Web Animations: each item gets a box by its label, and animate is a spy.
    const BOXES: Record<string, { left: number; width: number }> = {
      light: { left: 0, width: 50 },
      dark: { left: 50, width: 60 },
      system: { left: 110, width: 70 },
      // Where a running slide has drawn the pill.
      pill: { left: 20, width: 100 },
    };
    const ROWS: Record<string, { top: number; height: number }> = {
      light: { top: 0, height: 30 },
      dark: { top: 30, height: 40 },
      system: { top: 70, height: 30 },
      pill: { top: 10, height: 50 },
    };

    function stubLayout() {
      const key = (el: HTMLElement) =>
        el.dataset.testId === "vc-tab-switch-group-pill" ? "pill" : (el.getAttribute("aria-label") ?? "");
      const box = (el: HTMLElement) => BOXES[key(el)] ?? { left: 0, width: 0 };
      const row = (el: HTMLElement) => ROWS[key(el)] ?? { top: 0, height: 0 };

      vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
        return box(this).left;
      });
      vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
        return box(this).width;
      });

      vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
        return row(this).top;
      });
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
        return row(this).height;
      });

      const animate = vi.fn();
      Object.defineProperty(HTMLElement.prototype, "animate", { value: animate, configurable: true });

      return animate;
    }

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
      Reflect.deleteProperty(HTMLElement.prototype, "animate");
    });

    it("is not rendered while nothing is checked", () => {
      const wrapper = createWrapper();

      expect(pill(wrapper).exists()).toBe(false);
    });

    it("stretches over both items, then settles on the newly checked one", async () => {
      const animate = stubLayout();
      const wrapper = createWrapper("light");
      await nextTick();

      expect(pill(wrapper).attributes("style")).toContain("width: 50px");

      await radios(wrapper)[2].trigger("click");

      const [keyframes] = animate.mock.calls[0] as [Keyframe[]];

      expect(keyframes).toEqual([
        { left: "0px", width: "50px" },
        { left: "0px", width: "180px", offset: 0.42 },
        { left: "110px", width: "70px" },
      ]);
      expect(pill(wrapper).attributes("style")).toContain("left: 110px");
    });

    it("starts a move during a running slide from where the pill is drawn", async () => {
      const animate = stubLayout();
      animate.mockReturnValue({ playState: "running", cancel: vi.fn() });
      const wrapper = createWrapper("light");
      await nextTick();

      await radios(wrapper)[2].trigger("click");
      await radios(wrapper)[1].trigger("click");

      const [keyframes] = animate.mock.calls[1] as [Keyframe[]];

      expect(keyframes[0]).toEqual({ left: "20px", width: "100px" });
    });

    it("slides along the stack in a vertical group", async () => {
      const animate = stubLayout();
      const wrapper = createWrapper("light", [], "vertical");
      await nextTick();

      await radios(wrapper)[2].trigger("click");

      const [keyframes] = animate.mock.calls[0] as [Keyframe[]];

      expect(keyframes).toEqual([
        { top: "0px", height: "30px" },
        { top: "0px", height: "100px", offset: 0.42 },
        { top: "70px", height: "30px" },
      ]);
      expect(pill(wrapper).attributes("style")).toContain("top: 70px");
    });

    it("starts a vertical move during a running slide from where the pill is drawn", async () => {
      const animate = stubLayout();
      animate.mockReturnValue({ playState: "running", cancel: vi.fn() });
      const wrapper = createWrapper("light", [], "vertical");
      await nextTick();

      await radios(wrapper)[2].trigger("click");
      await radios(wrapper)[1].trigger("click");

      const [keyframes] = animate.mock.calls[1] as [Keyframe[]];

      expect(keyframes[0]).toEqual({ top: "10px", height: "50px" });
    });

    it("moves the pill without animation when the direction changes", async () => {
      const animate = stubLayout();
      vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
        return this.closest('[aria-orientation="vertical"]') ? 30 : 0;
      });
      const wrapper = createWrapper("dark");
      await nextTick();

      await wrapper.setProps({ direction: "vertical" });

      expect(animate).not.toHaveBeenCalled();
      expect(pill(wrapper).attributes("style")).toContain("top: 30px");
    });

    it("jumps without animation when the user prefers reduced motion", async () => {
      vi.stubGlobal(
        "matchMedia",
        vi.fn((query: string) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      );
      const animate = stubLayout();
      const wrapper = createWrapper("light");
      await nextTick();

      await radios(wrapper)[2].trigger("click");

      expect(animate).not.toHaveBeenCalled();
      expect(pill(wrapper).attributes("style")).toContain("left: 110px");
    });
  });

  describe("keyboard", () => {
    it("moves and selects with the arrows, wrapping at the ends", async () => {
      const wrapper = createWrapper("light");

      await radios(wrapper)[0].trigger("keydown", { key: "ArrowRight" });
      expect(checkedStates(wrapper)).toEqual(["false", "true", "false"]);

      await radios(wrapper)[1].trigger("keydown", { key: "ArrowDown" });
      expect(checkedStates(wrapper)).toEqual(["false", "false", "true"]);

      await radios(wrapper)[2].trigger("keydown", { key: "ArrowRight" });
      expect(checkedStates(wrapper)).toEqual(["true", "false", "false"]);

      await radios(wrapper)[0].trigger("keydown", { key: "ArrowLeft" });
      expect(checkedStates(wrapper)).toEqual(["false", "false", "true"]);
      expect(document.activeElement).toBe(radios(wrapper)[2].element);

      await radios(wrapper)[2].trigger("keydown", { key: "ArrowUp" });
      expect(checkedStates(wrapper)).toEqual(["false", "true", "false"]);
    });

    it("leaves arrows with a modifier key to the browser", async () => {
      const wrapper = createWrapper("light");

      await radios(wrapper)[0].trigger("keydown", { key: "ArrowRight", altKey: true });

      expect(checkedStates(wrapper)).toEqual(["true", "false", "false"]);
    });

    it("goes to the ends with Home and End", async () => {
      const wrapper = createWrapper("dark");

      await radios(wrapper)[1].trigger("keydown", { key: "End" });
      expect(checkedStates(wrapper)).toEqual(["false", "false", "true"]);

      await radios(wrapper)[2].trigger("keydown", { key: "Home" });
      expect(checkedStates(wrapper)).toEqual(["true", "false", "false"]);
    });

    it("swaps the horizontal arrows in RTL", async () => {
      const wrapper = createWrapper("dark");
      (wrapper.findComponent(VcTabSwitchGroup).element as HTMLElement).style.direction = "rtl";

      await radios(wrapper)[1].trigger("keydown", { key: "ArrowRight" });
      expect(checkedStates(wrapper)).toEqual(["true", "false", "false"]);

      await radios(wrapper)[0].trigger("keydown", { key: "ArrowLeft" });
      expect(checkedStates(wrapper)).toEqual(["false", "true", "false"]);

      await radios(wrapper)[1].trigger("keydown", { key: "ArrowDown" });
      expect(checkedStates(wrapper)).toEqual(["false", "false", "true"]);

      await radios(wrapper)[2].trigger("keydown", { key: "ArrowUp" });
      expect(checkedStates(wrapper)).toEqual(["false", "true", "false"]);
    });

    it("skips a disabled item", async () => {
      const wrapper = createWrapper("light", ["dark"]);

      await radios(wrapper)[0].trigger("keydown", { key: "ArrowRight" });

      expect(checkedStates(wrapper)).toEqual(["false", "false", "true"]);
    });
  });
});
