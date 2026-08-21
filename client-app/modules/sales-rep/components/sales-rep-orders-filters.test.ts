import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import SalesRepOrdersFilters from "./sales-rep-orders-filters.vue";

const createWrapper = createWrapperFactory(mount, SalesRepOrdersFilters, {
  props: { statuses: [{ name: "on-hold", label: "On hold", count: 4 }] },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcPopover: {
        template: '<div><slot :trigger-props="{}" /><slot name="content" :close="close" /></div>',
        methods: { close: () => {} },
      },
      VcDialog: { template: "<div><slot /></div>" },
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
      VcDatePicker: {
        props: ["modelValue"],
        emits: ["update:modelValue", "update:valid"],
        template:
          '<input class="date" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      },
      VcCheckboxGroup: {
        name: "VcCheckboxGroup",
        props: ["modelValue"],
        emits: ["update:modelValue"],
        template: "<div><slot /></div>",
      },
      VcCheckbox: { props: ["value"], template: "<label><slot /></label>" },
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
    const wrapper = createWrapper();

    rangeSelect(wrapper).vm.$emit("change", {
      id: "lastWeek",
      label: "Last week",
      startDate: "2026-05-01",
      endDate: "2026-05-08",
    });
    await nextTick();

    await applyButton(wrapper).trigger("click");

    expect(lastChange(wrapper)).toMatchObject({ startDate: "2026-05-01", endDate: "2026-05-08" });
  });

  it("blocks Apply while the custom range runs backwards", async () => {
    const wrapper = createWrapper();
    const dates = wrapper.findAll("input.date");

    await dates[0].setValue("2026-05-31");
    await dates[1].setValue("2026-05-01");

    expect(applyButton(wrapper).attributes("disabled")).toBeDefined();

    await dates[1].setValue("2026-06-01");

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
