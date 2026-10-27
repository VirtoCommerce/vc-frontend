import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { createI18n } from "vue-i18n";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcDropdownMenu, VcInput, VcMenuItem, VcSelect } from "@/ui-kit/components/molecules";
import { BREAKPOINTS } from "@/ui-kit/constants";
import SalesRepOrdersFilters from "./sales-rep-orders-filters.vue";
import type { Plugin } from "vue";

const isPhone = ref(false);
const askedBreakpoints: string[] = [];
const breakpointScales: unknown[] = [];

vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  return {
    ...actual,
    useBreakpoints: (scale: unknown) => {
      breakpointScales.push(scale);
      return {
        smaller: (name: string) => {
          askedBreakpoints.push(name);
          return isPhone;
        },
      };
    },
  };
});

afterEach(() => {
  isPhone.value = false;
  vi.useRealTimers();
});

const createWrapper = createWrapperFactory(mount, SalesRepOrdersFilters, {
  props: { statuses: [{ name: "on-hold", label: "On hold", count: 4 }] },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      // Props declared, so the stub cannot swallow the dialog opt-in this drawer depends on.
      VcPopover: {
        name: "VcPopover",
        props: ["role", "ariaLabel", "disabled"],
        template: '<div><slot :trigger-props="{}" /><slot name="content" :close="close" /></div>',
        methods: { close: () => {} },
      },
      VcDialog: { name: "VcDialog", props: ["autoFocus"], template: "<div><slot /></div>" },
      VcDialogHeader: { template: "<div><slot /></div>" },
      VcDialogContent: { template: "<div><slot /></div>" },
      VcDialogFooter: { template: "<div><slot /></div>" },
      VcButton: {
        props: ["disabled"],
        emits: ["click"],
        template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
      },
      VcSelect: {
        name: "VcSelect",
        props: ["modelValue", "items"],
        emits: ["update:modelValue", "change"],
        template: "<div />",
      },
      VcDateRangePicker: {
        name: "VcDateRangePicker",
        props: {
          modelValue: { type: Object, default: undefined },
          layout: { type: String, default: undefined },
          label: { type: String, default: undefined },
          startLabel: { type: String, default: undefined },
          endLabel: { type: String, default: undefined },
          mask: Boolean,
          enableTeleport: Boolean,
          showEmptyDetails: Boolean,
          showFooter: Boolean,
        },
        emits: ["update:modelValue", "update:valid"],
        template: "<div />",
      },
      VcCheckboxGroup: {
        name: "VcCheckboxGroup",
        props: ["modelValue"],
        emits: ["update:modelValue"],
        template: "<div><slot /></div>",
      },
      VcCheckbox: { props: ["value"], template: "<label><slot /></label>" },
      VcBadge: { template: '<span class="badge"><slot /></span>' },
      VcLabel: true,
      VcInputDetails: true,
      VcIcon: true,
    },
  },
});

type WrapperType = ReturnType<typeof createWrapper>;

const footerButtons = (wrapper: WrapperType) => wrapper.findAll("button").slice(1);
const applyButton = (wrapper: WrapperType) => footerButtons(wrapper)[1];
const resetButton = (wrapper: WrapperType) => footerButtons(wrapper)[0];

const statuses = (wrapper: WrapperType) => wrapper.findComponent({ name: "VcCheckboxGroup" });
const rangeSelect = (wrapper: WrapperType) => wrapper.findComponent({ name: "VcSelect" });
const rangePicker = (wrapper: WrapperType) => wrapper.findComponent({ name: "VcDateRangePicker" });

const lastChange = (wrapper: WrapperType) => wrapper.emitted("change")?.at(-1)?.[0];

describe("SalesRepOrdersFilters", () => {
  it("keeps Apply disabled until the draft differs from what was applied", async () => {
    const wrapper = createWrapper();

    expect(applyButton(wrapper).attributes("disabled")).toBeDefined();

    await statuses(wrapper).setValue(["on-hold"]);

    expect(applyButton(wrapper).attributes("disabled")).toBeUndefined();
  });

  it("emits the drafted selection only on Apply", async () => {
    const wrapper = createWrapper();

    await statuses(wrapper).setValue(["on-hold"]);
    expect(wrapper.emitted("change")).toBeUndefined();

    await applyButton(wrapper).trigger("click");

    expect(lastChange(wrapper)).toMatchObject({ statuses: ["on-hold"] });
  });

  it("fills both bounds from a preset range", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 4, 8, 10, 30));
    const wrapper = createWrapper();

    rangeSelect(wrapper).vm.$emit("change", "lastWeek");
    await nextTick();

    await applyButton(wrapper).trigger("click");

    expect(lastChange(wrapper)).toMatchObject({ startDate: "2026-05-01", endDate: "2026-05-08" });
  });

  it("drafts the custom range the picker reports", async () => {
    const wrapper = createWrapper();

    rangePicker(wrapper).vm.$emit("update:modelValue", { start: "2026-05-01", end: "2026-05-31" });
    await nextTick();

    expect(rangePicker(wrapper).props("modelValue")).toEqual({ start: "2026-05-01", end: "2026-05-31" });

    await applyButton(wrapper).trigger("click");

    expect(lastChange(wrapper)).toMatchObject({ startDate: "2026-05-01", endDate: "2026-05-31" });
  });

  it("keeps a one-sided custom range", async () => {
    const wrapper = createWrapper();

    rangePicker(wrapper).vm.$emit("update:modelValue", { start: "2026-05-01", end: undefined });
    await nextTick();

    expect(rangePicker(wrapper).props("modelValue")).toEqual({ start: "2026-05-01", end: undefined });

    await applyButton(wrapper).trigger("click");

    expect(lastChange(wrapper)).toMatchObject({ startDate: "2026-05-01", endDate: undefined });
  });

  it("clears both bounds when the picker empties the range", async () => {
    const wrapper = createWrapper({
      props: {
        statuses: [],
        applied: { statuses: [], customerNames: [], startDate: "2026-05-01", endDate: "2026-05-31" },
      },
    });
    await wrapper.setProps({
      applied: { statuses: [], customerNames: [], startDate: "2026-05-01", endDate: "2026-05-31" },
    });

    rangePicker(wrapper).vm.$emit("update:modelValue", undefined);
    await nextTick();

    expect(rangePicker(wrapper).props("modelValue")).toBeUndefined();

    await applyButton(wrapper).trigger("click");

    expect(lastChange(wrapper)).toMatchObject({ startDate: undefined, endDate: undefined });
  });

  it("blocks Apply while the picker reports the custom range invalid", async () => {
    const wrapper = createWrapper();

    rangePicker(wrapper).vm.$emit("update:modelValue", { start: "2026-05-31", end: "2026-05-01" });
    rangePicker(wrapper).vm.$emit("update:valid", false);
    await nextTick();

    expect(applyButton(wrapper).attributes("disabled")).toBeDefined();

    rangePicker(wrapper).vm.$emit("update:valid", true);
    await nextTick();

    expect(applyButton(wrapper).attributes("disabled")).toBeUndefined();
  });

  it("forgets an invalid custom range once a preset replaces it", async () => {
    const wrapper = createWrapper();

    rangePicker(wrapper).vm.$emit("update:valid", false);
    rangeSelect(wrapper).vm.$emit("change", "lastWeek");
    await nextTick();

    expect(applyButton(wrapper).attributes("disabled")).toBeUndefined();
  });

  it("emits an empty selection on Reset", async () => {
    const wrapper = createWrapper();

    await statuses(wrapper).setValue(["on-hold"]);
    await applyButton(wrapper).trigger("click");
    await resetButton(wrapper).trigger("click");

    expect(lastChange(wrapper)).toEqual({
      statuses: [],
      customerNames: [],
      startDate: undefined,
      endDate: undefined,
    });
  });

  it("shows each option's order count beside its label", () => {
    const wrapper = createWrapper();
    const option = wrapper.find(".sales-rep-orders-filters__option");

    expect(option.find(".sales-rep-orders-filters__option-label").text()).toBe("On hold");
    expect(option.find(".badge").text()).toBe("4");
  });

  it("follows the applied filter, so a chip removed on the page clears its checkbox", async () => {
    const wrapper = createWrapper();

    await statuses(wrapper).setValue(["on-hold"]);
    await applyButton(wrapper).trigger("click");

    expect(statuses(wrapper).props("modelValue")).toEqual(["on-hold"]);

    await wrapper.setProps({
      applied: { statuses: [], customerNames: [], startDate: undefined, endDate: undefined },
    });

    expect(statuses(wrapper).props("modelValue")).toEqual([]);
  });

  const appliedLastWeek = { statuses: [], customerNames: [], startDate: "2026-05-01", endDate: "2026-05-08" };

  it.each([
    ["start", { ...appliedLastWeek, startDate: undefined }, { start: undefined, end: "2026-05-08" }],
    ["end", { ...appliedLastWeek, endDate: undefined }, { start: "2026-05-01", end: undefined }],
  ])(
    "falls back to a custom range that keeps the other bound when a preset's %s chip is removed",
    async (_bound, applied, keptRange) => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(2026, 4, 8, 10, 30));
      const wrapper = createWrapper();

      rangeSelect(wrapper).vm.$emit("update:modelValue", "lastWeek");
      rangeSelect(wrapper).vm.$emit("change", "lastWeek");
      await nextTick();
      await applyButton(wrapper).trigger("click");

      expect(lastChange(wrapper)).toEqual(appliedLastWeek);

      await wrapper.setProps({ applied: appliedLastWeek });

      expect(rangeSelect(wrapper).props("modelValue")).toBe("lastWeek");
      expect(rangePicker(wrapper).exists()).toBe(false);

      await wrapper.setProps({ applied });

      expect(rangeSelect(wrapper).props("modelValue")).toBe("custom");
      expect(rangePicker(wrapper).props("modelValue")).toEqual(keptRange);
    },
  );

  it("offers a customer group only where the page passes customers", async () => {
    const wrapper = createWrapper();
    const groups = () => wrapper.findAll(".sales-rep-orders-filters__statuses");

    expect(groups()).toHaveLength(1);

    await wrapper.setProps({ customers: [{ name: "ACME", label: "ACME", count: 3 }] });

    expect(groups()).toHaveLength(2);
  });

  it("renders no status block when the listed orders carry no statuses", async () => {
    const wrapper = createWrapper();
    expect(statuses(wrapper).exists()).toBe(true);

    await wrapper.setProps({ statuses: [] });

    expect(statuses(wrapper).exists()).toBe(false);
  });
});

describe("SalesRepOrdersFilters — the dialog opt-in", () => {
  it("declares the panel a dialog, names it, and hands it initial focus instead of VcDialog", () => {
    const wrapper = createWrapper();
    const popover = wrapper.findComponent({ name: "VcPopover" });

    expect(popover.props("role")).toBe("dialog");
    expect(popover.props("ariaLabel")).toBe("sales_rep.customer_orders.filters.title");
    expect(wrapper.findComponent({ name: "VcDialog" }).props("autoFocus")).toBe(false);
  });
});

describe("SalesRepOrdersFilters — the date range field", () => {
  it("shows two labelled fields on a wide screen", () => {
    const picker = rangePicker(createWrapper());

    expect(picker.props()).toMatchObject({
      layout: "split",
      label: undefined,
      startLabel: "sales_rep.customer_orders.filters.start_date",
      endLabel: "sales_rep.customer_orders.filters.end_date",
    });
  });

  it("masks the field, teleports its calendar, and keeps its details row and calendar footer", () => {
    expect(rangePicker(createWrapper()).props()).toMatchObject({
      mask: true,
      enableTeleport: true,
      showEmptyDetails: true,
      // The calendar footer's Clear is the field's pointer route back to empty.
      showFooter: true,
    });
  });

  // `sm`, as the account orders filter splits them — the ticket measured the merged field at 375px.
  it("switches layouts at the sm breakpoint", () => {
    askedBreakpoints.length = 0;
    breakpointScales.length = 0;
    createWrapper();

    expect(askedBreakpoints).toEqual(["sm"]);
    expect(breakpointScales).toEqual([BREAKPOINTS]);
  });

  // "combined" renders the start/end labels as aria-labels only, so the one visible label names the pair.
  it("merges them into one field, labelled as a range, on a phone", async () => {
    const wrapper = createWrapper();

    isPhone.value = true;
    await nextTick();

    expect(rangePicker(wrapper).props()).toMatchObject({
      layout: "combined",
      label: "sales_rep.customer_orders.filters.date_range",
    });
  });
});

describe("SalesRepOrdersFilters — the Created date field", () => {
  // The real select, so the field's text and the active option are VcSelect's own, not a stub's.
  const createWrapperWithSelect = (plugins: Plugin[] = []) =>
    createWrapper({
      global: {
        plugins,
        components: { VcDropdownMenu, VcInput, VcMenuItem, VcSelect },
        stubs: { VcSelect: false, VcScrollbar: { template: "<ul><slot /></ul>" } },
      },
    });

  const fieldText = (wrapper: WrapperType) => (wrapper.get(".vc-select input").element as HTMLInputElement).value;
  const options = (wrapper: WrapperType) => wrapper.findAll('[role="option"]');
  const activeOptions = (wrapper: WrapperType) =>
    options(wrapper)
      .filter((option) => option.attributes("aria-selected") === "true")
      .map((option) => option.text());

  it("labels the field from the live items, so a module locale that loads late still reaches it", async () => {
    const i18n = createI18n({ legacy: false, locale: "en", messages: {}, missingWarn: false, fallbackWarn: false });
    const wrapper = createWrapperWithSelect([i18n]);

    expect(fieldText(wrapper)).toBe("sales_rep.customer_orders.filters.custom_date");

    i18n.global.setLocaleMessage("en", { sales_rep: { customer_orders: { filters: { custom_date: "Custom date" } } } });
    await nextTick();

    expect(fieldText(wrapper)).toBe("Custom date");
  });

  it("marks the selected range active, before and after a pick", async () => {
    const wrapper = createWrapperWithSelect();

    expect(activeOptions(wrapper)).toEqual(["sales_rep.customer_orders.filters.custom_date"]);

    const lastWeek = options(wrapper).find((option) => option.text() === "sales_rep.customer_orders.filters.last_week");
    await lastWeek!.trigger("click");

    expect(activeOptions(wrapper)).toEqual(["sales_rep.customer_orders.filters.last_week"]);
    expect(fieldText(wrapper)).toBe("sales_rep.customer_orders.filters.last_week");
  });
});
