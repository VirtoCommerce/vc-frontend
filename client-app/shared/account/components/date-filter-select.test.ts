import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { DateFilterId } from "@/core/enums";
import DateFilterSelect from "./date-filter-select.vue";
import type { DateFilterType } from "@/core/types";

// The rest of the composable pulls in useUser/GraphQL.
vi.mock("../composables/useUserOrdersFilter", () => ({
  useUserOrdersFilter: () => ({
    dateFilterTypes: { value: [{ id: DateFilterId.CUSTOM, label: "Custom date" }] },
  }),
}));

// Stubbed: their own behavior is covered by their own test files, only the wiring is asserted here.
const stubs = { VcSelect: true, VcDateRangePicker: true };

function mountWithCustomSelected(
  props: Partial<{ dateFilterType: DateFilterType; label: string; layout: VcDateRangePickerLayoutType }> = {},
) {
  return mount(DateFilterSelect, {
    props: { dateFilterType: { id: DateFilterId.CUSTOM, label: "Custom date" }, ...props },
    global: {
      stubs,
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("DateFilterSelect", () => {
  it("re-emits change when the range picker updates", async () => {
    const wrapper = mountWithCustomSelected();
    const picker = wrapper.findComponent({ name: "VcDateRangePicker" });
    picker.vm.$emit("update:modelValue", { start: "2026-10-08", end: "2026-10-14" });
    await wrapper.vm.$nextTick();
    const change = wrapper.emitted("change")?.at(-1)?.[0] as { startDate?: string; endDate?: string };
    expect(change.startDate).toBe("2026-10-08");
    expect(change.endDate).toBe("2026-10-14");
  });

  it("re-emits update:valid from the range picker", async () => {
    const wrapper = mountWithCustomSelected();
    const picker = wrapper.findComponent({ name: "VcDateRangePicker" });
    picker.vm.$emit("update:valid", false);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
  });

  it("forwards layout to the range picker", () => {
    const wrapper = mountWithCustomSelected({ layout: "split" });
    expect(wrapper.findComponent({ name: "VcDateRangePicker" }).attributes("layout")).toBe("split");
  });

  it("defaults layout to combined", () => {
    const wrapper = mountWithCustomSelected();
    expect(wrapper.findComponent({ name: "VcDateRangePicker" }).attributes("layout")).toBe("combined");
  });
});
