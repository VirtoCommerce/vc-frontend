import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import VcBadge from "../../atoms/badge/vc-badge.vue";
import VcVariantPickerGroup from "../variant-picker-group/vc-variant-picker-group.vue";
import VcVariantPicker from "./vc-variant-picker.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

// Same default-slot contract as VcTooltip: the trigger gets `triggerProps` and `tooltipId`.
const VcTooltipStub = defineComponent({
  name: "VcTooltip",

  setup(_, { slots }) {
    return () => h("div", slots.default?.({ triggerProps: {}, tooltipId: "tooltip-id" }));
  },
});

const GLOBAL = {
  components: { VcBadge, VcTooltip: VcTooltipStub },
  stubs: { VcIcon: true, VcImage: true },
};

interface IMountOptions {
  props?: Partial<InstanceType<typeof VcVariantPicker>["$props"]>;
  slots?: Record<string, string>;
  global?: { provide?: Record<string, unknown> };
}

function mountPicker(options: IMountOptions = {}) {
  return mount(VcVariantPicker, {
    props: { type: "text", value: "1m", testId: "picker", ...options.props },
    slots: options.slots,
    global: { ...GLOBAL, ...options.global },
  });
}

function makeContext(overrides: Partial<VcVariantPickerGroupContextType> = {}): VcVariantPickerGroupContextType {
  return {
    modelValue: ref(""),
    multiple: ref(false),
    size: ref(undefined),
    type: ref("text"),
    name: ref("period"),
    fill: ref(false),
    surface: ref("base"),
    toggleValue: vi.fn(),
    registerTopBadge: vi.fn(() => vi.fn()),
    ...overrides,
  };
}

function trigger(wrapper: ReturnType<typeof mountPicker>) {
  return wrapper.find('[data-test-id="picker"]');
}

describe("VcVariantPicker (text)", () => {
  it("shows the value and names the button with it when nothing else is set", () => {
    const wrapper = mountPicker();

    expect(trigger(wrapper).text()).toBe("1m");
    expect(trigger(wrapper).attributes("aria-label")).toBe("1m");
  });

  it("shows the label instead of the value", () => {
    const wrapper = mountPicker({ props: { label: "1 month" } });

    expect(trigger(wrapper).text()).toBe("1 month");
    expect(trigger(wrapper).attributes("aria-label")).toBe("1 month");
  });

  it("renders the description and lets the visible content name the button", () => {
    const wrapper = mountPicker({ props: { label: "1 month", description: "Save 12%" } });

    expect(trigger(wrapper).text()).toContain("1 month");
    expect(trigger(wrapper).text()).toContain("Save 12%");
    expect(trigger(wrapper).attributes("aria-label")).toBeUndefined();
  });

  it("renders the description slot", () => {
    const wrapper = mountPicker({ props: { label: "1 month" }, slots: { description: "$58.08" } });

    expect(trigger(wrapper).text()).toContain("$58.08");
  });

  it("renders a soft badge inside the tile by default", () => {
    const wrapper = mountPicker({ props: { label: "1 month", badge: "−12%" } });
    const badge = wrapper.findComponent(VcBadge);

    expect(badge.text()).toBe("−12%");
    expect(badge.props()).toMatchObject({ variant: "soft", size: "sm", color: "success" });
  });

  it("uses an xs badge on small sizes", () => {
    const wrapper = mountPicker({ props: { label: "1 month", badge: "−12%", size: "xs" } });

    expect(wrapper.findComponent(VcBadge).props("size")).toBe("xs");
  });

  it.each([
    ["base", "soft"],
    ["tinted", "outline"],
    ["dark", "outline"],
  ] as const)("uses a %s-surface corner badge variant of %s", (surface, variant) => {
    const wrapper = mountPicker({
      props: { label: "1 month", badge: "−12%", badgePosition: "top" },
      global: { provide: { variantPickerGroupContext: makeContext({ surface: ref(surface) }) } },
    });

    expect(wrapper.findComponent(VcBadge).props()).toMatchObject({ variant, size: "xs" });
  });

  it("keeps an explicit badge variant", () => {
    const wrapper = mountPicker({
      props: { label: "1 month", badge: "New", badgePosition: "top", badgeVariant: "solid" },
      global: { provide: { variantPickerGroupContext: makeContext({ surface: ref("tinted") }) } },
    });

    expect(wrapper.findComponent(VcBadge).props("variant")).toBe("solid");
  });

  it("registers a corner badge with the group and unregisters it on unmount", () => {
    const unregister = vi.fn();
    const context = makeContext({ registerTopBadge: vi.fn(() => unregister) });
    const wrapper = mountPicker({
      props: { label: "1 month", badge: "−12%", badgePosition: "top" },
      global: { provide: { variantPickerGroupContext: context } },
    });

    expect(context.registerTopBadge).toHaveBeenCalledTimes(1);

    wrapper.unmount();

    expect(unregister).toHaveBeenCalledTimes(1);
  });

  it("does not register a badge inside the tile", () => {
    const context = makeContext();

    mountPicker({
      props: { label: "1 month", badge: "−12%" },
      global: { provide: { variantPickerGroupContext: context } },
    });

    expect(context.registerTopBadge).not.toHaveBeenCalled();
  });

  it("selects its value through the group", async () => {
    const context = makeContext();
    const wrapper = mountPicker({
      props: { label: "1 month", description: "Save 12%" },
      global: { provide: { variantPickerGroupContext: context } },
    });

    await trigger(wrapper).trigger("click");

    expect(context.toggleValue).toHaveBeenCalledWith("1m");
  });
});

describe("VcVariantPickerGroup layout", () => {
  function mountGroup(props: Record<string, unknown> = {}, badgePosition: VcVariantPickerBadgePositionType = "end") {
    return mount(VcVariantPickerGroup, {
      props: { type: "text", name: "period", testId: "group", ...props },
      slots: {
        default: () =>
          ["2w", "1m"].map((value) => h(VcVariantPicker, { value, label: value, badge: "−5%", badgePosition })),
      },
      global: { ...GLOBAL, stubs: { ...GLOBAL.stubs, VcButton: true } },
    });
  }

  it("stretches tiles in a column grid and sizes them by text otherwise", () => {
    expect(mountGroup({ columns: 2 }).findComponent(VcVariantPicker).classes()).toContain("vc-variant-picker--fill");
    expect(mountGroup().findComponent(VcVariantPicker).classes()).not.toContain("vc-variant-picker--fill");
  });

  it("follows an explicit fill", () => {
    expect(mountGroup({ columns: 2, fill: false }).findComponent(VcVariantPicker).classes()).not.toContain(
      "vc-variant-picker--fill",
    );
    expect(mountGroup({ fill: true }).findComponent(VcVariantPicker).classes()).toContain("vc-variant-picker--fill");
  });

  it("reserves room only while a tile has a corner badge", async () => {
    const withTop = mountGroup({}, "top");
    const withEnd = mountGroup({}, "end");

    await nextTick();

    expect(withTop.classes()).toContain("vc-variant-picker-group--with-top-badge");
    expect(withEnd.classes()).not.toContain("vc-variant-picker-group--with-top-badge");
  });
});
