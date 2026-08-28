import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { DateFilterId } from "@/core/enums";
import { VcInputDetails, VcLabel } from "@/ui-kit/components/atoms";
import DateFilterSelect from "./date-filter-select.vue";
import type { DateFilterType } from "@/core/types";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcCalendar from "@/ui-kit/components/molecules/calendar/vc-calendar.vue";
import VcRangeCalendar from "@/ui-kit/components/molecules/calendar/vc-range-calendar.vue";
import VcDateInput from "@/ui-kit/components/molecules/date-input/vc-date-input.vue";
import VcDateRangeInput from "@/ui-kit/components/molecules/date-range-input/vc-date-range-input.vue";
import VcInput from "@/ui-kit/components/molecules/input/vc-input.vue";
import VcPopover from "@/ui-kit/components/molecules/popover/vc-popover.vue";
import VcDatePicker from "@/ui-kit/components/organisms/date-picker/vc-date-picker.vue";
import VcDateRangePicker from "@/ui-kit/components/organisms/date-range-picker/vc-date-range-picker.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }) }));

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

  // "combined" turns the per-field labels into aria-labels, so without a group label the mobile filter
  // shows two unlabelled date boxes.
  it("labels the combined field, and leaves split to its own field labels", () => {
    const combined = mountWithCustomSelected();
    expect(combined.findComponent({ name: "VcDateRangePicker" }).attributes("label")).toBe(
      "shared.account.orders_filter.date_range_label",
    );

    const split = mountWithCustomSelected({ layout: "split" });
    expect(split.findComponent({ name: "VcDateRangePicker" }).attributes("label")).toBeUndefined();
  });

  // reka's prevent-deselect took away the re-click that used to drop a date, so the calendar footer is
  // the pointer path back — in both layouts.
  it("asks for the calendar footer", () => {
    expect(
      mountWithCustomSelected().findComponent({ name: "VcDateRangePicker" }).attributes("show-footer"),
    ).toBeDefined();
  });

  // Apply is gated on this emit, and the seeded ref is a starting point, not a verdict on the range.
  describe("initial validity", () => {
    it("says nothing before the range picker has reported", () => {
      const wrapper = mountWithCustomSelected({
        dateFilterType: {
          id: DateFilterId.CUSTOM,
          label: "Custom date",
          startDate: "2026-10-20",
          endDate: "2026-10-08",
        },
      });
      expect(wrapper.emitted("update:valid")).toBeUndefined();
    });

    // The stubbed picker above emits nothing, so the real chain is what proves the verdict arrives.
    // Both layouts ship: split on desktop, combined on mobile.
    it.each(["split", "combined"] as const)(
      "reports an out-of-order range as invalid in %s, and only that",
      (layout) => {
        const wrapper = mount(DateFilterSelect, {
          props: {
            layout,
            dateFilterType: {
              id: DateFilterId.CUSTOM,
              label: "Custom date",
              startDate: "2026-10-20",
              endDate: "2026-10-08",
            },
          },
          global: {
            components: {
              VcDateInput,
              VcInput,
              VcInputDetails,
              VcLabel,
              VcButton,
              VcPopover,
              VcCalendar,
              VcRangeCalendar,
              VcDateRangeInput,
              VcDatePicker,
              VcDateRangePicker,
            },
            stubs: { VcSelect: true, VcIcon: true, VcTooltip: true },
            directives: { "html-safe": {} },
            mocks: { $t: (key: string) => key },
          },
        });

        expect(wrapper.emitted("update:valid")).toEqual([[false]]);
        wrapper.unmount();
      },
    );
  });
});
