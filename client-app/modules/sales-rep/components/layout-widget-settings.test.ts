import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { provideLayoutSettings } from "../composables/useLayoutSettings";
import { WIDGET_DRAG_FILTER_SELECTOR, WIDGET_DRAG_HANDLE_SELECTOR } from "../constants";
import LayoutBlock from "./layout-block.vue";
import LayoutWidget from "./layout-widget.vue";
import SalesRepRuleToggles from "./sales-rep-rule-toggles.vue";
import type { ILayoutSettingsType } from "../composables/useLayoutSettings";
import type { SalesRepBlockSettingsType } from "../types/layout";
import type { PropType } from "vue";
import VcCheckbox from "@/ui-kit/components/atoms/checkbox/vc-checkbox.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcInput from "@/ui-kit/components/molecules/input/vc-input.vue";
import VcWidget from "@/ui-kit/components/organisms/widget/vc-widget.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

// The kit components under test are real — their prop and slot contracts are exactly what this
// feature leans on, and a stub would keep passing after one of them changed. The rest are stubbed
// because the compiler hoists component resolution above the `v-if` that would reach them.
const global = {
  components: { VcButton, VcCheckbox, VcInput, VcWidget },
  stubs: {
    VcIcon: true,
    VcShape: true,
    VcLabel: true,
    VcInputDetails: true,
    // A bare stub would swallow the checkbox label, which lives in its `trigger` slot.
    VcTooltip: { template: '<span><slot name="trigger" /></span>' },
  },
};

const MAX_ROWS = { kind: "maxRows", default: 5, min: 1, max: 20 } as const;

// The settings seam is a provide, so a real parent has to install it — `global.provide` cannot, the
// injection key being module-private on purpose.
const Surface = defineComponent({
  props: {
    settings: { type: Object as PropType<ILayoutSettingsType>, required: true },
    editing: { type: Boolean, default: true },
  },

  setup(props, { slots }) {
    // eslint-disable-next-line vue/no-setup-props-reactivity-loss -- each mount installs one fixed seam
    provideLayoutSettings(props.settings);

    return () =>
      h(LayoutBlock, { blockId: "orders", title: "Recent orders", editing: props.editing }, { default: slots.default });
  },
});

const widgetSlot =
  (extra: Record<string, () => unknown> = {}) =>
  () =>
    h(LayoutWidget, { title: "Recent orders", size: "md" }, { default: () => "body", ...extra });

/** A block inside a surface that declares a row cap, so the widget renders the rows field. */
function mountConfigurableBlock(options: {
  editing?: boolean;
  values?: SalesRepBlockSettingsType;
  configurable?: boolean;
  widgetSlots?: Record<string, () => unknown>;
}) {
  const update = vi.fn();
  const values = options.values ?? { maxRows: 5, hiddenTabs: [] };
  const settings: ILayoutSettingsType = {
    valuesOf: () => values,
    maxRowsOf: () => (options.configurable === false ? undefined : MAX_ROWS),
    update,
  };

  const wrapper = mount(Surface, {
    props: { settings, editing: options.editing ?? true },
    slots: { default: widgetSlot(options.widgetSlots) },
    global,
  });

  return { wrapper, update };
}

describe("the max-rows field in a widget header", () => {
  it("renders inside the widget's own header, next to the hide button", () => {
    const { wrapper } = mountConfigurableBlock({});
    const header = wrapper.get(".vc-widget__header-container").element;

    expect(header.querySelector(".layout-widget__rows")).not.toBeNull();
    expect(header.querySelector(".layout-widget__hide")).not.toBeNull();
  });

  // The field sits inside the drag surface, so only Sortable's `filter` keeps a mousedown in it from
  // starting a drag instead of focusing the input.
  it("matches the drag filter selector while inside the drag handle", () => {
    const { wrapper } = mountConfigurableBlock({});
    const rows = wrapper.get(".layout-widget__rows").element;

    expect(rows.closest(WIDGET_DRAG_HANDLE_SELECTOR)).not.toBeNull();
    expect(rows.matches(WIDGET_DRAG_FILTER_SELECTOR)).toBe(true);
  });

  it("does not render outside edit mode", () => {
    const { wrapper } = mountConfigurableBlock({ editing: false });

    expect(wrapper.find(".layout-widget__rows").exists()).toBe(false);
  });

  it("does not render for a block that declares no row cap", () => {
    const { wrapper } = mountConfigurableBlock({ configurable: false });

    expect(wrapper.find(".layout-widget__rows").exists()).toBe(false);
  });

  it("carries the block's own bounds onto the rendered input", () => {
    const { wrapper } = mountConfigurableBlock({});
    const input = wrapper.get(".layout-widget__rows input").element as HTMLInputElement;

    expect(input.min).toBe("1");
    expect(input.max).toBe("20");
  });

  it("commits an in-range value as it is typed", async () => {
    const { wrapper, update } = mountConfigurableBlock({});

    await wrapper.get(".layout-widget__rows input").setValue("8");

    expect(update).toHaveBeenCalledWith("orders", { maxRows: 8 });
  });

  // Rejecting it mid-keystroke would rewrite "1" before the second digit of "12" arrived.
  it("holds an out-of-range value until blur, then clamps it", async () => {
    const { wrapper, update } = mountConfigurableBlock({});
    const input = wrapper.get(".layout-widget__rows input");

    await input.setValue("99");
    expect(update).not.toHaveBeenCalled();

    await input.trigger("blur");
    expect(update).toHaveBeenCalledWith("orders", { maxRows: 20 });
  });

  it("keeps an emptied field editable and commits nothing", async () => {
    const { wrapper, update } = mountConfigurableBlock({});

    await wrapper.get(".layout-widget__rows input").setValue("");

    expect(update).not.toHaveBeenCalled();
  });

  // The rows field takes the place of the widget's own header content, which is the only combination
  // that overflows a narrow header.
  it("replaces the widget's own header content while it is shown", () => {
    const append = { append: () => h("a", { class: "view-all" }, "View all") };

    const editing = mountConfigurableBlock({ widgetSlots: append });
    expect(editing.wrapper.find(".view-all").exists()).toBe(false);

    const idle = mountConfigurableBlock({ editing: false, widgetSlots: append });
    expect(idle.wrapper.find(".view-all").exists()).toBe(true);
  });
});

describe("SalesRepRuleToggles", () => {
  const rules = [
    { name: "New", label: "New" },
    { name: "Processing", label: "Processing" },
  ];

  function mountToggles(hidden: string[]) {
    return mount(SalesRepRuleToggles, { props: { rules, hidden }, global });
  }

  it("checks a rule that is not hidden, and labels it from the backend", () => {
    const boxes = mountToggles(["Processing"]).findAll("input[type=checkbox]");

    expect((boxes[0].element as HTMLInputElement).checked).toBe(true);
    expect((boxes[1].element as HTMLInputElement).checked).toBe(false);
  });

  it("reports a toggle by rule name", async () => {
    const wrapper = mountToggles([]);

    await wrapper.findAll("input[type=checkbox]")[1].setValue(false);

    expect(wrapper.emitted("toggle")).toEqual([["Processing"]]);
  });

  // Disabling the box is the whole enforcement of "at least one tab stays visible".
  it("disables the last checked box", () => {
    const boxes = mountToggles(["Processing"]).findAll("input[type=checkbox]");

    expect((boxes[0].element as HTMLInputElement).disabled).toBe(true);
    expect((boxes[1].element as HTMLInputElement).disabled).toBe(false);
  });

  it("disables nothing while more than one rule is checked", () => {
    const boxes = mountToggles([]).findAll("input[type=checkbox]");

    expect(boxes.every((box) => !(box.element as HTMLInputElement).disabled)).toBe(true);
  });
});
