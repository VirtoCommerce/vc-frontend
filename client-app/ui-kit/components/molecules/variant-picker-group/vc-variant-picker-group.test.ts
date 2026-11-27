import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import VcButton from "../button/vc-button.vue";
import VcVariantPicker from "../variant-picker/vc-variant-picker.vue";
import VcVariantPickerGroup from "./vc-variant-picker-group.vue";
import type { VueWrapper } from "@vue/test-utils";
import type { Component, VNode } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const VcTooltipStub = defineComponent({
  name: "VcTooltip",

  setup(_, { slots }) {
    return () => h("div", slots.default?.({ triggerProps: {}, tooltipId: "tooltip-id" }));
  },
});

const VcButtonStub = defineComponent({
  name: "VcButton",

  setup(_, { slots, expose }) {
    const element = ref<HTMLButtonElement | null>(null);

    expose({ focus: () => element.value?.focus() });

    return () => h("button", { ref: element, type: "button" }, slots.default?.());
  },
});

const GLOBAL = {
  components: { VcTooltip: VcTooltipStub, VcButton: VcButtonStub },
  stubs: { VcIcon: true, VcImage: true },
};

const WIDTH_CLASSES = ["vc-variant-picker--width--stretch", "vc-variant-picker--width--share"];

function mountGroupWith(
  props: Record<string, unknown>,
  pickers: () => VNode[],
  attrs: Record<string, unknown> = {},
  components: Record<string, Component> = {},
) {
  return mount(VcVariantPickerGroup, {
    props: { type: "card", name: "period", ...props },
    attrs,
    slots: { default: pickers },
    global: { ...GLOBAL, components: { ...GLOBAL.components, ...components } },
    attachTo: document.body,
  });
}

function mountGroup(
  props: Record<string, unknown> = {},
  count = 2,
  widths: number[] = [],
  components: Record<string, Component> = {},
) {
  return mountGroupWith(
    props,
    () =>
      Array.from({ length: count }, (_, index) =>
        h(VcVariantPicker, { key: index, value: `v${index}`, style: widths[index] && `width: ${widths[index]}px` }),
      ),
    {},
    components,
  );
}

function widthClasses(wrapper: ReturnType<typeof mountGroup>): string[][] {
  return wrapper
    .findAllComponents(VcVariantPicker)
    .map((picker) => picker.classes().filter((name) => WIDTH_CLASSES.includes(name)));
}

const ROW_HEIGHT = 44;
const ROW_WIDTH = 100;
const BUTTON_WIDTH = 20;

// jsdom has no layout: fake offsetTop. Grid: cells row by row; flex-wrap: inline width (else BUTTON_WIDTH), gaps ignored.
function layOutRows() {
  return vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    const group = this.parentElement;

    if (!group?.classList.contains("vc-variant-picker-group")) {
      return 0;
    }

    const columns = Number(/--columns--(\d)/.exec(group.className)?.[1] ?? 0);
    const shown = Array.from(group.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.style.display !== "none",
    );

    if (columns) {
      return Math.floor(shown.indexOf(this) / columns) * ROW_HEIGHT;
    }

    let row = 0;
    let used = 0;

    for (const el of shown) {
      const width = Number.parseFloat(el.style.width) || BUTTON_WIDTH;

      if (used > 0 && used + width > ROW_WIDTH) {
        row += 1;
        used = 0;
      }

      used += width;

      if (el === this) {
        return row * ROW_HEIGHT;
      }
    }

    return 0;
  });
}

function shownPickers(wrapper: ReturnType<typeof mountGroup>): number {
  return wrapper
    .findAllComponents(VcVariantPicker)
    .filter((picker) => (picker.element as HTMLElement).style.display !== "none").length;
}

function isShowMoreShown(wrapper: ReturnType<typeof mountGroup>): boolean {
  const button = wrapper.find(".vc-variant-picker-group__wrapper");

  return button.exists() && (button.element as HTMLElement).style.display !== "none";
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("VcVariantPickerGroup layout", () => {
  it.each(["color", "image", "text", "card"])("a %s group without columns or fullWidth keeps base markup", (type) => {
    const wrapper = mountGroup({ type });

    expect(wrapper.classes()).toEqual(["vc-variant-picker-group"]);
    expect(wrapper.attributes("style")).toBeUndefined();
    expect(widthClasses(wrapper)).toEqual([[], []]);
  });

  it.each([1, 2, 3, 4])("lays %i columns out as a grid with modifier classes, no style", (columns) => {
    const wrapper = mountGroup({ columns });

    expect(wrapper.classes()).toEqual([
      "vc-variant-picker-group",
      "vc-variant-picker-group--columns",
      `vc-variant-picker-group--columns--${columns}`,
    ]);
    expect(wrapper.attributes("style")).toBeUndefined();
  });

  it.each([
    ["card", { columns: 2 }, "vc-variant-picker--width--stretch"],
    ["text", { columns: 2 }, "vc-variant-picker--width--stretch"],
    ["card", { columns: 2, fullWidth: true }, "vc-variant-picker--width--stretch"],
    ["card", { fullWidth: true }, "vc-variant-picker--width--share"],
    ["text", { fullWidth: true }, "vc-variant-picker--width--share"],
  ])("a %s picker with %j gets %s", (type, layout, widthClass) => {
    const wrapper = mountGroup({ type, ...layout });

    expect(widthClasses(wrapper)).toEqual([[widthClass], [widthClass]]);
  });

  it.each([
    ["color", { columns: 3 }],
    ["color", { fullWidth: true }],
    ["image", { columns: 2 }],
    ["image", { fullWidth: true }],
  ])("a %s swatch with %j keeps its size", (type, layout) => {
    const wrapper = mountGroup({ type, ...layout });

    expect(widthClasses(wrapper)).toEqual([[], []]);
  });

  it("keeps a picker at its content's width in a group context without width", () => {
    const context: VcVariantPickerGroupContextType = {
      modelValue: ref(""),
      multiple: ref(false),
      size: ref(undefined),
      type: ref("card"),
      name: ref("period"),
      toggleValue: vi.fn(),
    };

    const picker = mount(VcVariantPicker, {
      props: { value: "v0" },
      global: { ...GLOBAL, provide: { variantPickerGroupContext: context } },
    });

    expect(picker.classes().filter((name) => WIDTH_CLASSES.includes(name))).toEqual([]);
  });
});

function triggersOf(wrapper: VueWrapper): HTMLElement[] {
  return wrapper.findAll<HTMLElement>(".vc-variant-picker__trigger").map((trigger) => trigger.element);
}

function tabindexes(wrapper: VueWrapper): (string | null)[] {
  return triggersOf(wrapper).map((trigger) => trigger.getAttribute("tabindex"));
}

function press(element: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });

  element.dispatchEvent(event);

  return event;
}

// The elements Tab visits in document order: tabindex 0 or a native button, none inside a hidden picker.
function tabSequence(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>("button, [tabindex]")).filter(
    (el) => el.tabIndex >= 0 && !el.closest('[style*="display: none"]'),
  );
}

describe("VcVariantPickerGroup keyboard: one Tab stop in a single-choice group", () => {
  it.each([
    ["the checked picker", { modelValue: "v1" }, ["-1", "0", "-1"]],
    ["the first picker while none is checked", {}, ["0", "-1", "-1"]],
  ])("gives tabindex 0 to %s only", async (_, props, expected) => {
    const wrapper = mountGroup(props, 3);

    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(expected);
  });

  it("gives the tab stop to the first shown picker while truncation hides the checked one", async () => {
    layOutRows();
    const wrapper = mountGroup({ columns: 2, truncate: true, maxRows: 2, modelValue: "v5" }, 7);

    await flushPromises();

    expect(shownPickers(wrapper)).toBe(3);
    expect(tabindexes(wrapper)).toEqual(["0", "-1", "-1", "-1", "-1", "-1", "-1"]);
  });

  it("moves the tab stop when the model changes", async () => {
    const wrapper = mountGroup({ modelValue: "v0" }, 3);

    await wrapper.setProps({ modelValue: "v2" });
    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(["-1", "-1", "0"]);
  });

  it("gives the tab stop to a picker added later while none is checked", async () => {
    const count = ref(0);
    const wrapper = mountGroupWith({}, () =>
      Array.from({ length: count.value }, (_, index) => h(VcVariantPicker, { key: index, value: `v${index}` })),
    );

    count.value = 2;
    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(["0", "-1"]);
  });

  it("moves the tab stop to a picker selected without the focus (a screen reader's click)", async () => {
    const wrapper = mountGroup({ modelValue: "v0" }, 3);

    await wrapper.findAll(".vc-variant-picker__trigger")[2].trigger("click");
    await flushPromises();

    expect(document.activeElement).toBe(document.body);
    expect(tabindexes(wrapper)).toEqual(["-1", "-1", "0"]);
  });

  it("gives the tab stop to a trigger focused from outside the group", async () => {
    const wrapper = mountGroup({}, 3);
    const outside = document.body.appendChild(document.createElement("button"));

    outside.focus();
    triggersOf(wrapper)[2].focus();
    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(["-1", "-1", "0"]);
  });

  it("keeps the tab stop on a shown picker when a resize measures the same +N again", async () => {
    let onResize: () => void = () => undefined;

    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          onResize = callback;
        }

        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      },
    );
    layOutRows();
    const wrapper = mountGroup({ columns: 2, truncate: true, maxRows: 2, modelValue: "v5" }, 7);

    await flushPromises();
    onResize();
    await new Promise((resolve) => setTimeout(resolve, 150));
    await flushPromises();

    expect(shownPickers(wrapper)).toBe(3);
    expect(tabindexes(wrapper)).toEqual(["0", "-1", "-1", "-1", "-1", "-1", "-1"]);
  });

  it("keeps one tab stop whatever the pickers' own tabindex", async () => {
    const wrapper = mountGroupWith({ modelValue: "v0" }, () => [
      h(VcVariantPicker, { value: "v0", tabindex: -1 }),
      h(VcVariantPicker, { value: "v1", tabindex: 0 }),
      h(VcVariantPicker, { value: "v2" }),
    ]);

    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(["0", "-1", "-1"]);
  });

  it("gives the tab stop and the arrow keys to pickers inside a wrapper element", async () => {
    const wrapper = mountGroupWith({ modelValue: "v2" }, () => [
      h(VcVariantPicker, { value: "v0" }),
      h("div", [h(VcVariantPicker, { value: "v1" }), h(VcVariantPicker, { value: "v2" })]),
    ]);
    const triggers = triggersOf(wrapper);

    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(["-1", "-1", "0"]);

    triggers[2].focus();
    press(triggers[2], "ArrowRight");

    expect(document.activeElement).toBe(triggers[0]);

    press(triggers[0], "ArrowRight");

    expect(document.activeElement).toBe(triggers[1]);
  });

  it("puts the +N button right after the group's one tab stop and lets Tab leave both", async () => {
    layOutRows();
    const wrapper = mountGroup({ columns: 2, truncate: true, maxRows: 2, modelValue: "v1" }, 7);

    await flushPromises();

    const button = wrapper.find<HTMLElement>(".vc-variant-picker-group__button").element;

    expect(tabSequence()).toEqual([triggersOf(wrapper)[1], button]);
    expect(press(triggersOf(wrapper)[1], "Tab").defaultPrevented).toBe(false);
    expect(press(triggersOf(wrapper)[1], "Tab", { shiftKey: true }).defaultPrevented).toBe(false);
    expect(press(button, "Tab").defaultPrevented).toBe(false);
  });

  it("keeps the tab stop on the focused trigger and gives it back to the checked one when the focus leaves", async () => {
    const wrapper = mountGroup({ modelValue: "v0" }, 3);
    const outside = document.body.appendChild(document.createElement("button"));

    await flushPromises();
    triggersOf(wrapper)[0].focus();
    press(triggersOf(wrapper)[0], "ArrowRight");
    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(["-1", "0", "-1"]);

    outside.focus();
    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(["0", "-1", "-1"]);
  });

  it("focuses the first picker the +N button shows and keeps one tab stop", async () => {
    layOutRows();
    const wrapper = mountGroup({ columns: 2, truncate: true, maxRows: 2, modelValue: "v0" }, 7);

    await flushPromises();
    await wrapper.find(".vc-variant-picker-group__button").trigger("click");
    await flushPromises();

    expect(shownPickers(wrapper)).toBe(7);
    expect(document.activeElement).toBe(triggersOf(wrapper)[3]);
    expect(tabindexes(wrapper)).toEqual(["-1", "-1", "-1", "0", "-1", "-1", "-1"]);
  });
});

describe("VcVariantPickerGroup keyboard: arrows in a single-choice group", () => {
  it.each([
    ["card", "DIV"],
    ["text", "BUTTON"],
  ])("move the focus, not the selection, between %s triggers (%s), wrapping", async (type, tagName) => {
    const wrapper = mountGroup({ type, modelValue: "v0" }, 3);
    const triggers = triggersOf(wrapper);

    expect(triggers[0].tagName).toBe(tagName);

    triggers[0].focus();

    for (const [key, index] of [
      ["ArrowRight", 1],
      ["ArrowDown", 2],
      ["ArrowRight", 0],
      ["ArrowLeft", 2],
      ["ArrowUp", 1],
    ] as const) {
      press(document.activeElement as HTMLElement, key);
      await flushPromises();

      expect(document.activeElement).toBe(triggers[index]);
    }

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("change")).toBeUndefined();
    expect(triggers.map((trigger) => trigger.getAttribute("aria-checked"))).toEqual(["true", "false", "false"]);
  });

  it("go to the first and the last picker with Home and End", () => {
    const wrapper = mountGroup({ modelValue: "v1" }, 5);
    const triggers = triggersOf(wrapper);

    triggers[1].focus();

    expect(press(triggers[1], "End").defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(triggers[4]);

    press(triggers[4], "ArrowLeft");

    expect(press(triggers[3], "Home").defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(triggers[0]);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("stop on an unavailable picker as on any other", () => {
    const wrapper = mountGroupWith({ type: "text", name: "size", modelValue: "s" }, () => [
      h(VcVariantPicker, { value: "s", isAvailable: true }),
      h(VcVariantPicker, { value: "m", isAvailable: false }),
    ]);
    const triggers = triggersOf(wrapper);

    press(triggers[0], "ArrowRight");

    expect(document.activeElement).toBe(triggers[1]);
  });

  it("swap the horizontal arrows in RTL, not the vertical ones", () => {
    const wrapper = mountGroupWith(
      { modelValue: "v0" },
      () => ["v0", "v1", "v2"].map((value) => h(VcVariantPicker, { key: value, value })),
      { style: "direction: rtl" },
    );
    const triggers = triggersOf(wrapper);

    press(triggers[0], "ArrowLeft");

    expect(document.activeElement).toBe(triggers[1]);

    press(triggers[1], "ArrowDown");

    expect(document.activeElement).toBe(triggers[2]);

    press(triggers[2], "ArrowRight");

    expect(document.activeElement).toBe(triggers[1]);
  });

  it.each([
    ["Shift", { shiftKey: true }],
    ["Alt", { altKey: true }],
    ["Ctrl", { ctrlKey: true }],
    ["Meta", { metaKey: true }],
  ])("are left to the browser with %s, and so are Home and End", (_, init) => {
    const wrapper = mountGroup({ modelValue: "v1" }, 3);
    const triggers = triggersOf(wrapper);

    triggers[1].focus();

    for (const key of ["ArrowRight", "Home", "End"]) {
      expect(press(triggers[1], key, init).defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(triggers[1]);
    }
  });

  it("do not scroll the page", () => {
    const wrapper = mountGroup({}, 2);

    expect(press(triggersOf(wrapper)[0], "ArrowDown").defaultPrevented).toBe(true);
  });

  it("do nothing on a picker truncation hides", async () => {
    layOutRows();
    const wrapper = mountGroup({ columns: 2, truncate: true, maxRows: 2, modelValue: "v0" }, 7);

    await flushPromises();

    const hidden = triggersOf(wrapper)[5];

    expect(press(hidden, "ArrowRight").defaultPrevented).toBe(false);
  });

  it("cycle over the shown pickers only, never to the +N button, and the button ignores them", async () => {
    layOutRows();
    const wrapper = mountGroup({ columns: 2, truncate: true, maxRows: 2, modelValue: "v2" }, 7);

    await flushPromises();

    const triggers = triggersOf(wrapper);
    const button = wrapper.find<HTMLElement>(".vc-variant-picker-group__button").element;

    triggers[2].focus();
    press(triggers[2], "ArrowRight");

    expect(document.activeElement).toBe(triggers[0]);

    button.focus();

    expect(press(button, "ArrowLeft").defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(button);
  });
});

describe("VcVariantPickerGroup keyboard: Space and Enter in a single-choice group", () => {
  it.each([
    ["Space", " "],
    ["Enter", "Enter"],
  ])("%s selects the focused picker and the focus stays on it", async (_, key) => {
    const wrapper = mountGroup({ modelValue: "v0" }, 3);
    const triggers = triggersOf(wrapper);

    triggers[0].focus();
    press(triggers[0], "ArrowRight");
    press(triggers[1], key);
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")).toEqual([["v1"]]);
    expect(triggers[1].getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(triggers[1]);
    expect(tabindexes(wrapper)).toEqual(["-1", "0", "-1"]);
  });
});

describe("VcVariantPickerGroup keyboard in a multiple group: the base keys", () => {
  it("makes every checkbox a Tab stop", async () => {
    const wrapper = mountGroup({ multiple: true, modelValue: ["v1"] }, 3);

    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(["0", "0", "0"]);
  });

  it("keeps a picker's own tabindex", async () => {
    const wrapper = mountGroupWith({ multiple: true, modelValue: [] }, () => [
      h(VcVariantPicker, { value: "v0" }),
      h(VcVariantPicker, { value: "v1", tabindex: -1 }),
    ]);

    await flushPromises();

    expect(tabindexes(wrapper)).toEqual(["0", "-1"]);
  });

  it.each([
    ["card", "DIV"],
    ["text", "BUTTON"],
  ])("moves only the focus between %s triggers (%s) with the arrows, stopping at the ends", (type, tagName) => {
    const wrapper = mountGroup({ type, multiple: true, modelValue: [] }, 2);
    const triggers = triggersOf(wrapper);

    expect(triggers[0].tagName).toBe(tagName);

    triggers[0].focus();

    for (const [key, index] of [
      ["ArrowLeft", 0],
      ["ArrowRight", 1],
      ["ArrowRight", 1],
      ["ArrowUp", 0],
      ["ArrowDown", 1],
    ] as const) {
      expect(press(document.activeElement as HTMLElement, key).defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(triggers[index]);
    }

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("moves the focus with Tab and Shift+Tab between pickers", () => {
    const wrapper = mountGroup({ multiple: true }, 3);
    const triggers = triggersOf(wrapper);

    triggers[0].focus();

    expect(press(triggers[0], "Tab").defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(triggers[1]);
    expect(press(triggers[1], "Tab", { shiftKey: true }).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(triggers[0]);
  });

  it.each([
    ["Shift+Tab on the first picker", 0, true],
    ["Tab on the last picker", 2, false],
  ])("lets %s leave the group", (_, index, shiftKey) => {
    const wrapper = mountGroup({ multiple: true }, 3);

    expect(press(triggersOf(wrapper)[index], "Tab", { shiftKey }).defaultPrevented).toBe(false);
  });

  it("lets Tab on the +N button leave the group and takes Shift+Tab back to the last shown picker", async () => {
    layOutRows();
    const wrapper = mountGroup({ multiple: true, columns: 2, truncate: true, maxRows: 2 }, 7);

    await flushPromises();

    const button = wrapper.find<HTMLElement>(".vc-variant-picker-group__button").element;

    expect(press(button, "Tab").defaultPrevented).toBe(false);
    expect(press(button, "Tab", { shiftKey: true }).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(triggersOf(wrapper)[2]);
  });

  it("moves the focus between the last shown picker and the +N button, the real VcButton passing its keydown on", async () => {
    layOutRows();
    const wrapper = mountGroup({ multiple: true, columns: 2, truncate: true, maxRows: 2 }, 7, [], { VcButton });

    await flushPromises();

    const triggers = triggersOf(wrapper);
    const button = wrapper.find<HTMLElement>(".vc-variant-picker-group__wrapper > button").element;

    triggers[2].focus();
    press(triggers[2], "ArrowRight");

    expect(document.activeElement).toBe(button);

    press(button, "ArrowLeft");

    expect(document.activeElement).toBe(triggers[2]);
  });

  it("toggles the focused picker with Space and Enter", async () => {
    const wrapper = mountGroup({ multiple: true, modelValue: [] }, 3);
    const triggers = triggersOf(wrapper);

    press(triggers[1], " ");
    await flushPromises();
    press(triggers[1], "Enter");

    expect(wrapper.emitted("update:modelValue")).toEqual([[["v1"]], [[]]]);
  });
});

describe("VcVariantPickerGroup truncation in columns", () => {
  it.each([
    [1, 1],
    [2, 3],
    [3, 5],
  ])("in %i column(s) fills two rows with %i pickers and the +N button", async (columns, shown) => {
    layOutRows();
    const wrapper = mountGroup({ columns, truncate: true, maxRows: 2 }, 7);

    await flushPromises();

    expect(shownPickers(wrapper)).toBe(shown);
    expect(isShowMoreShown(wrapper)).toBe(true);
  });

  it("in one column with maxRows 1 keeps the first picker, the +N button on the next row", async () => {
    layOutRows();
    const wrapper = mountGroup({ columns: 1, truncate: true, maxRows: 1 }, 7);

    await flushPromises();

    expect(shownPickers(wrapper)).toBe(1);
    expect(isShowMoreShown(wrapper)).toBe(true);
    expect(wrapper.find(".vc-variant-picker-group__button").text()).toBe("+6");
  });

  it("in one column with maxRows 3 shows two pickers, the +N button on the third row", async () => {
    layOutRows();
    const wrapper = mountGroup({ columns: 1, truncate: true, maxRows: 3 }, 5);

    await flushPromises();

    expect(shownPickers(wrapper)).toBe(2);
    expect(wrapper.find(".vc-variant-picker-group__button").text()).toBe("+3");
  });

  it("shows both of two pickers in one column with maxRows 1: a +1 button would take the hidden one's row", async () => {
    layOutRows();
    const wrapper = mountGroup({ columns: 1, truncate: true, maxRows: 1 }, 2);

    await flushPromises();

    expect(shownPickers(wrapper)).toBe(2);
    expect(isShowMoreShown(wrapper)).toBe(false);
  });

  it("measures again when columns change", async () => {
    layOutRows();
    const wrapper = mountGroup({ columns: 3, truncate: true, maxRows: 2 }, 7);

    await flushPromises();

    expect(shownPickers(wrapper)).toBe(5);

    await wrapper.setProps({ columns: 4 });
    await flushPromises();

    expect(shownPickers(wrapper)).toBe(7);
    expect(isShowMoreShown(wrapper)).toBe(false);
  });

  it("without columns keeps the +N button on the last picker's row", async () => {
    layOutRows();
    const wrapper = mountGroup({ truncate: true, maxRows: 2 }, 4, [50, 50, 90, 90]);

    await flushPromises();

    expect(shownPickers(wrapper)).toBe(1);
    expect(isShowMoreShown(wrapper)).toBe(true);
  });

  it("shows both of two full-width pickers with maxRows 1: a +1 button would take the hidden one's row", async () => {
    layOutRows();
    const wrapper = mountGroup({ fullWidth: true, truncate: true, maxRows: 1 }, 2, [100, 100]);

    await flushPromises();

    expect(shownPickers(wrapper)).toBe(2);
    expect(isShowMoreShown(wrapper)).toBe(false);
  });

  it("without columns keeps a +1 button that saves a row", async () => {
    layOutRows();
    const wrapper = mountGroup({ truncate: true, maxRows: 1 }, 3, [40, 40, 90]);

    await flushPromises();

    expect(shownPickers(wrapper)).toBe(2);
    expect(wrapper.find(".vc-variant-picker-group__button").text()).toBe("+1");
  });

  it.each([
    ["full-width", { fullWidth: true }],
    ["content-width", {}],
  ])(
    "in a %s group keeps the first picker when the +N button cannot share its row, the button below it",
    async (_, props) => {
      layOutRows();
      const wrapper = mountGroup({ ...props, truncate: true, maxRows: 1 }, 3, [100, 100, 100]);

      await flushPromises();

      expect(shownPickers(wrapper)).toBe(1);
      expect(isShowMoreShown(wrapper)).toBe(true);
      expect(wrapper.find(".vc-variant-picker-group__button").text()).toBe("+2");
    },
  );

  it.each([
    ["full-width", { fullWidth: true }],
    ["content-width", {}],
  ])(
    "in a %s group shows every picker when the +N button below the first one would take as many rows",
    async (_, props) => {
      layOutRows();
      const wrapper = mountGroup({ ...props, truncate: true, maxRows: 1 }, 3, [100, 40, 40]);

      await flushPromises();

      expect(shownPickers(wrapper)).toBe(3);
      expect(isShowMoreShown(wrapper)).toBe(false);
    },
  );
});
