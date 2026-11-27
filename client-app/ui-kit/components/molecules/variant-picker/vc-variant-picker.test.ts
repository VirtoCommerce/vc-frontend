import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { Logger } from "@/ui-kit/utilities/logger";
import VcCheckbox from "../../atoms/checkbox/vc-checkbox.vue";
import VcRadioButton from "../../atoms/radio-button/vc-radio-button.vue";
import VcTooltip from "../../atoms/tooltip/vc-tooltip.vue";
import VcPopover from "../popover/vc-popover.vue";
import VcVariantPickerGroup from "../variant-picker-group/vc-variant-picker-group.vue";
import VcVariantPicker from "./vc-variant-picker.vue";
import type { Ref } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

// The listeners VcPopover's trigger props carry (vc-popover.vue, emitTriggerProps).
const TRIGGER_LISTENERS = {
  mouseenter: vi.fn(),
  mouseleave: vi.fn(),
  focusin: vi.fn(),
  focusout: vi.fn(),
  click: vi.fn(),
  keydown: vi.fn(),
};

const TRIGGER_PROPS = {
  role: "button",
  "aria-haspopup": "dialog",
  "aria-expanded": true,
  "aria-controls": "tooltip-id",
  "aria-describedby": "tooltip-id",
  onMouseenter: TRIGGER_LISTENERS.mouseenter,
  onMouseleave: TRIGGER_LISTENERS.mouseleave,
  onFocusin: TRIGGER_LISTENERS.focusin,
  onFocusout: TRIGGER_LISTENERS.focusout,
  onClick: TRIGGER_LISTENERS.click,
  onKeydown: TRIGGER_LISTENERS.keydown,
};

const VcTooltipStub = defineComponent({
  name: "VcTooltip",
  props: { disabled: Boolean },

  setup(props, { slots }) {
    return () =>
      h("div", [
        slots.default?.({ triggerProps: TRIGGER_PROPS, tooltipId: "tooltip-id" }),
        props.disabled ? null : slots.content?.(),
      ]);
  },
});

const GLOBAL = {
  components: { VcTooltip: VcTooltipStub },
  stubs: { VcIcon: true, VcImage: true },
};

const TYPES: VcVariantPickerType[] = ["color", "image", "text", "card"];
const CARD_SLOTS = ["default", "prepend", "description", "append"];

type SlotsType = Record<string, (props: { checked: boolean }) => unknown>;

function mountPicker(props: Record<string, unknown> = {}, slots: SlotsType = {}) {
  return mount(VcVariantPicker, {
    props: { type: "card", value: "1m", testId: "picker", ...props },
    slots,
    global: GLOBAL,
  });
}

function mountGroup(groupProps: Record<string, unknown>, pickers: { value: string }[], slots: SlotsType = {}) {
  return mount(VcVariantPickerGroup, {
    props: { name: "group", ...groupProps },
    slots: {
      default: () => pickers.map((picker, index) => h(VcVariantPicker, { key: index, ...picker }, slots)),
    },
    global: GLOBAL,
  });
}

function mountWithToggledSlots(
  props: { type: VcVariantPickerType; value: string },
  slots: SlotsType,
  isShown: Ref<boolean>,
) {
  const Host = defineComponent({
    setup: () => () => h(VcVariantPicker, props, isShown.value ? slots : {}),
  });

  return mount(Host, { global: GLOBAL });
}

function trigger(wrapper: ReturnType<typeof mount>) {
  return wrapper.find(".vc-variant-picker__trigger");
}

function describedBy(wrapper: ReturnType<typeof mount>): string[] {
  return trigger(wrapper).attributes("aria-describedby")?.split(" ") ?? [];
}

function textOf(wrapper: ReturnType<typeof mount>, id: string): string {
  return wrapper.find(`[id="${id}"]`).text();
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("VcVariantPicker role and checked state", () => {
  it.each(TYPES)("a %s picker on its own is a radio with aria-checked", (type) => {
    const checked = mountPicker({ type, modelValue: "1m" });
    const unchecked = mountPicker({ type, modelValue: "2m" });

    expect(trigger(checked).attributes("role")).toBe("radio");
    expect(trigger(checked).attributes("aria-checked")).toBe("true");
    expect(trigger(unchecked).attributes("role")).toBe("radio");
    expect(trigger(unchecked).attributes("aria-checked")).toBe("false");
  });

  it.each(TYPES)("a %s picker in a single-choice group is a radio in a radiogroup", (type) => {
    const wrapper = mountGroup({ type, modelValue: "a" }, [{ value: "a" }, { value: "b" }]);
    const triggers = wrapper.findAll(".vc-variant-picker__trigger");

    expect(wrapper.attributes("role")).toBe("radiogroup");
    expect(triggers.map((el) => el.attributes("role"))).toEqual(["radio", "radio"]);
    expect(triggers.map((el) => el.attributes("aria-checked"))).toEqual(["true", "false"]);
  });

  it.each(TYPES)("a %s picker in a multiple group is a checkbox in a group", (type) => {
    const wrapper = mountGroup({ type, multiple: true, modelValue: ["b"] }, [{ value: "a" }, { value: "b" }]);
    const triggers = wrapper.findAll(".vc-variant-picker__trigger");

    expect(wrapper.attributes("role")).toBe("group");
    expect(triggers.map((el) => el.attributes("role"))).toEqual(["checkbox", "checkbox"]);
    expect(triggers.map((el) => el.attributes("aria-checked"))).toEqual(["false", "true"]);
  });

  it("keeps the tooltip's button role and popup state off the trigger", () => {
    const wrapper = mountPicker({ tooltip: "Ships monthly" });

    expect(trigger(wrapper).attributes("role")).toBe("radio");
    expect(trigger(wrapper).attributes("aria-haspopup")).toBeUndefined();
    expect(trigger(wrapper).attributes("aria-expanded")).toBeUndefined();
    expect(trigger(wrapper).attributes("aria-controls")).toBeUndefined();
  });

  it.each(Object.keys(TRIGGER_LISTENERS))("passes the tooltip's %s listener on to the trigger", async (event) => {
    const listener = TRIGGER_LISTENERS[event as keyof typeof TRIGGER_LISTENERS];
    const wrapper = mountPicker({ tooltip: "Ships monthly" });
    listener.mockClear();

    await trigger(wrapper).trigger(event);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("renders a card as a focusable div outside any label", () => {
    const card = mountPicker();

    expect(trigger(card).element.tagName).toBe("DIV");
    expect(trigger(card).attributes("tabindex")).toBe("0");
    expect(trigger(card).attributes("type")).toBeUndefined();
    expect(card.find("label").exists()).toBe(false);
  });

  it.each(["color", "image", "text"])("renders a %s picker as a non-submitting button in a label", (type) => {
    const wrapper = mountPicker({ type });

    expect(trigger(wrapper).element.tagName).toBe("BUTTON");
    expect(trigger(wrapper).attributes("type")).toBe("button");
    expect(wrapper.find(".vc-variant-picker__container").element.tagName).toBe("LABEL");
  });

  it.each([["click"], ["keydown.enter"], ["keydown.space"]])("a card toggles on %s", async (event) => {
    const wrapper = mountPicker();

    await trigger(wrapper).trigger(event);

    expect(wrapper.emitted("update:modelValue")).toEqual([["1m"]]);
  });

  it.each([
    ["Space", " "],
    ["Enter", "Enter"],
  ])("keeps %s on a card from scrolling the page or submitting a form", (_, key) => {
    const wrapper = mountPicker();
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });

    trigger(wrapper).element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it.each([
    ["default", ".vc-variant-picker__label"],
    ["prepend", ".vc-variant-picker__prepend"],
    ["description", ".vc-variant-picker__description"],
    ["append", ".vc-variant-picker__append"],
    ["corner", ".vc-variant-picker__corner"],
  ])("passes the checked state to the %s slot", (slotName, selector) => {
    const slots = { [slotName]: ({ checked }: { checked: boolean }) => `checked ${checked}` };

    const checked = mountPicker({ modelValue: "1m" }, slots);
    const unchecked = mountPicker({ modelValue: "2m" }, slots);

    expect(checked.find(selector).text()).toBe("checked true");
    expect(unchecked.find(selector).text()).toBe("checked false");
  });

  it("passes the checked state to the tooltip slot", () => {
    const slots = { tooltip: ({ checked }: { checked: boolean }) => `tooltip ${checked}` };

    expect(mountPicker({ modelValue: "1m" }, slots).text()).toContain("tooltip true");
    expect(mountPicker({ modelValue: "2m" }, slots).text()).toContain("tooltip false");
  });
});

describe("VcVariantPicker as an interactive parent", () => {
  const indicators = ({ checked }: { checked: boolean }) => [
    h(VcRadioButton, { value: "1m", modelValue: checked ? "1m" : "" }),
    h(VcCheckbox, { modelValue: checked }),
  ];

  function inputClasses(wrapper: ReturnType<typeof mount>): string[][] {
    return wrapper.findAll("input").map((input) => input.classes());
  }

  it("a VcRadioButton and a VcCheckbox in a card's prepend render no input of their own under the real VcTooltip", () => {
    const wrapper = mount(VcVariantPicker, {
      props: { type: "card", value: "1m", modelValue: "1m", tooltip: "Ships monthly" },
      slots: { prepend: indicators },
      global: { components: { VcTooltip, VcPopover }, stubs: { VcIcon: true } },
    });

    expect(wrapper.find(".vc-popover__trigger .vc-variant-picker__prepend .vc-radio-button").exists()).toBe(true);
    expect(wrapper.find(".vc-popover__trigger .vc-variant-picker__prepend .vc-checkbox").exists()).toBe(true);
    expect(inputClasses(wrapper)).toEqual([["vc-variant-picker__input"]]);
  });

  it.each(["color", "image", "text"])(
    "a VcRadioButton and a VcCheckbox in a %s picker's tooltip render no input of their own",
    (type) => {
      const wrapper = mountPicker({ type, modelValue: "1m" }, { tooltip: indicators });

      expect(wrapper.find(".vc-radio-button").exists()).toBe(true);
      expect(wrapper.find(".vc-checkbox").exists()).toBe(true);
      expect(inputClasses(wrapper)).toEqual([["vc-variant-picker__input"]]);
    },
  );
});

describe("VcVariantPicker availability", () => {
  it.each([
    { isAvailable: undefined, modelValue: "2m", isUnavailable: true },
    { isAvailable: false, modelValue: "2m", isUnavailable: true },
    { isAvailable: true, modelValue: "2m", isUnavailable: false },
    { isAvailable: false, modelValue: "1m", isUnavailable: false },
  ])(
    "with isAvailable $isAvailable and model $modelValue is marked unavailable: $isUnavailable",
    ({ isAvailable, modelValue, isUnavailable }) => {
      const wrapper = mountPicker({ isAvailable, modelValue });

      expect(wrapper.classes("vc-variant-picker--unavailable")).toBe(isUnavailable);
    },
  );

  it.each([
    ["card", "2m", ["vc-variant-picker--unavailable", "vc-variant-picker--card"]],
    ["card", "1m", ["vc-variant-picker--card"]],
    ["text", "2m", ["vc-variant-picker--unavailable"]],
  ])("an unavailable %s picker, model %s, has the state classes %j", (type, modelValue, classes) => {
    const wrapper = mountPicker({ type, isAvailable: false, modelValue });

    expect(wrapper.classes().filter((name) => /--(unavailable|card)$/.test(name))).toEqual(classes);
  });
});

describe("VcVariantPicker card name and description", () => {
  it("is named by its default slot, never by its tooltip", () => {
    const wrapper = mountPicker({ tooltip: "Ships monthly" }, { default: () => "1 month" });
    const labelledBy = trigger(wrapper).attributes("aria-labelledby");

    expect(trigger(wrapper).attributes("aria-label")).toBeUndefined();
    expect(labelledBy).toBeTruthy();
    expect(textOf(wrapper, labelledBy!)).toBe("1 month");
    expect(describedBy(wrapper)).toEqual(["tooltip-id"]);
  });

  it("is named by its value without a default slot", () => {
    const wrapper = mountPicker();

    expect(textOf(wrapper, trigger(wrapper).attributes("aria-labelledby")!)).toBe("1m");
  });

  it.each([
    [[], []],
    [["description"], ["Save 12%"]],
    [["append"], ["−12%"]],
    [["corner"], ["New"]],
    [
      ["description", "append", "corner"],
      ["Save 12%", "−12%", "New"],
    ],
  ])("with slots %j is described by %j, in order", (names, texts) => {
    const content: Record<string, string> = { description: "Save 12%", append: "−12%", corner: "New" };
    const slots = Object.fromEntries(names.map((name) => [name, () => content[name]]));

    const wrapper = mountPicker({}, slots);

    expect(describedBy(wrapper).map((id) => textOf(wrapper, id))).toEqual(texts);
  });

  it("puts the tooltip last among the regions that describe it", () => {
    const wrapper = mountPicker({ tooltip: "Tip" }, { description: () => "Save 12%", corner: () => "New" });

    expect(describedBy(wrapper).at(-1)).toBe("tooltip-id");
    expect(describedBy(wrapper)).toHaveLength(3);
  });

  it("follows a description slot added after mount", async () => {
    const isShown = ref(false);
    const wrapper = mountWithToggledSlots({ type: "card", value: "1m" }, { description: () => "Save 12%" }, isShown);

    expect(describedBy(wrapper)).toEqual([]);

    isShown.value = true;
    await nextTick();

    expect(describedBy(wrapper).map((id) => textOf(wrapper, id))).toEqual(["Save 12%"]);
  });
});

describe("VcVariantPicker colour, image and text names", () => {
  it.each([
    ["color", {}, "red"],
    ["color", { tooltip: "Red" }, "Red"],
    ["image", {}, "a.webp"],
    ["text", {}, "Size M"],
    ["text", { tooltip: "Medium" }, "Medium"],
  ])("a %s picker with %j is named %s", (type, props, name) => {
    const value = { color: "red", image: "a.webp", text: "Size M" }[type];

    const wrapper = mountPicker({ type, value, ...props });

    expect(trigger(wrapper).attributes("aria-label")).toBe(name);
    expect(trigger(wrapper).attributes("aria-labelledby")).toBeUndefined();
  });

  it("adds a corner region to aria-describedby, before the tooltip", () => {
    const wrapper = mountPicker({ type: "color", value: "red", tooltip: "Red" }, { corner: () => "New" });
    const ids = describedBy(wrapper);

    expect(ids).toHaveLength(2);
    expect(textOf(wrapper, ids[0])).toBe("New");
    expect(ids[1]).toBe("tooltip-id");
  });

  it("is described by nothing without a corner or a tooltip", () => {
    const wrapper = mountPicker({ type: "text", value: "Size M" });

    expect(trigger(wrapper).attributes("aria-describedby")).toBeUndefined();
  });
});

describe("VcVariantPicker corner", () => {
  it.each(TYPES)("a %s picker on its own keeps room for its corner content", (type) => {
    const wrapper = mountPicker({ type }, { corner: () => "New" });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(["vc-variant-picker--with-corner", "vc-variant-picker--corner-room"]),
    );
  });

  it("leaves the room to the group inside VcVariantPickerGroup", () => {
    const wrapper = mountGroup({ type: "color" }, [{ value: "red" }], { corner: () => "New" });
    const picker = wrapper.findComponent(VcVariantPicker);

    expect(picker.classes()).toContain("vc-variant-picker--with-corner");
    expect(picker.classes()).not.toContain("vc-variant-picker--corner-room");
  });

  it.each([
    ["color", ["vc-variant-picker", "vc-variant-picker--size--md", "vc-variant-picker--square"]],
    ["image", ["vc-variant-picker", "vc-variant-picker--size--md", "vc-variant-picker--square"]],
    ["text", ["vc-variant-picker", "vc-variant-picker--size--md"]],
    ["card", ["vc-variant-picker", "vc-variant-picker--size--md", "vc-variant-picker--card"]],
  ])("a %s picker without corner content has only its own classes", (type, classes) => {
    const wrapper = mountPicker({ type, isAvailable: true });

    expect(wrapper.classes()).toEqual(classes);
    expect(wrapper.find(".vc-variant-picker__corner").exists()).toBe(false);
  });
});

describe("VcVariantPicker card slots on other types", () => {
  it.each(CARD_SLOTS)("a text picker renders no %s slot and warns in DEV", (slotName) => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    const wrapper = mountPicker({ type: "text", value: "Size M" }, { [slotName]: () => "card content" });

    expect(wrapper.text()).not.toContain("card content");
    expect(trigger(wrapper).attributes("aria-describedby")).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('type is "card"; this picker is type "text"');
  });

  it("a card with every slot does not warn", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});
    const slots = Object.fromEntries([...CARD_SLOTS, "corner", "tooltip"].map((name) => [name, () => name]));

    mountPicker({}, slots);

    expect(warn).not.toHaveBeenCalled();
  });

  it("a swatch with corner and tooltip slots does not warn", () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});

    mountPicker({ type: "color", value: "red" }, { corner: () => "New", tooltip: () => "Red" });

    expect(warn).not.toHaveBeenCalled();
  });

  it("warns once when a card slot is added after mount", async () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});
    const isShown = ref(false);
    const wrapper = mountWithToggledSlots({ type: "color", value: "red" }, { prepend: () => "icon" }, isShown);

    expect(warn).not.toHaveBeenCalled();

    isShown.value = true;
    await nextTick();

    expect(warn).toHaveBeenCalledTimes(1);

    wrapper.findComponent(VcVariantPicker).vm.$forceUpdate();
    await nextTick();

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("warns again when a removed card slot comes back", async () => {
    const warn = vi.spyOn(Logger, "warn").mockImplementation(() => {});
    const isShown = ref(true);
    mountWithToggledSlots({ type: "color", value: "red" }, { prepend: () => "icon" }, isShown);

    expect(warn).toHaveBeenCalledTimes(1);

    isShown.value = false;
    await nextTick();
    isShown.value = true;
    await nextTick();

    expect(warn).toHaveBeenCalledTimes(2);
  });
});
