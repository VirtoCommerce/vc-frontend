import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcInputDetails, VcLabel } from "@/ui-kit/components/atoms";
import VcDatePicker from "../date-picker/vc-date-picker.vue";
import VcDateRangePicker from "./vc-date-range-picker.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcCalendar from "@/ui-kit/components/molecules/calendar/vc-calendar.vue";
import VcRangeCalendar from "@/ui-kit/components/molecules/calendar/vc-range-calendar.vue";
import VcDateInput from "@/ui-kit/components/molecules/date-input/vc-date-input.vue";
import VcDateRangeInput from "@/ui-kit/components/molecules/date-range-input/vc-date-range-input.vue";
import VcInput from "@/ui-kit/components/molecules/input/vc-input.vue";
import VcPopover from "@/ui-kit/components/molecules/popover/vc-popover.vue";

// Interpolating, unlike the main spec's key-only mock: these names differ only in their parameters.
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}(${String(params.field)})` : key),
    locale: { value: "en" },
  }),
}));

function mountSplit(props = {}) {
  return mount(VcDateRangePicker, {
    props: { modelValue: { start: "2026-08-01", end: "2026-08-31" }, layout: "split", clearable: true, ...props },
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
      },
      stubs: { VcIcon: true, VcTooltip: true },
      directives: { "html-safe": {} },
      mocks: { $t: (key: string) => key },
    },
  });
}

// The field buttons only: each field's calendar is mounted up front and brings buttons of its own.
const buttonNames = (wrapper: ReturnType<typeof mountSplit>) =>
  wrapper
    .findAll("button")
    .map((button) => button.attributes("aria-label"))
    .filter((name) => /clear|open_calendar/.test(name ?? ""));

describe("VcDateRangePicker — split field button names", () => {
  // Two fields side by side each carry a calendar trigger and a clear button; generic names would
  // leave assistive technology with two identical pairs.
  it("names each field's calendar trigger and clear button after that field's label", () => {
    const wrapper = mountSplit({ startLabel: "From", endLabel: "To" });

    expect(buttonNames(wrapper)).toEqual([
      "ui_kit.buttons.clear_field(From)",
      "ui_kit.accessibility.open_calendar_for(From)",
      "ui_kit.buttons.clear_field(To)",
      "ui_kit.accessibility.open_calendar_for(To)",
    ]);
  });

  it("falls back to the start/end field names when the caller gives no labels", () => {
    const wrapper = mountSplit();

    expect(buttonNames(wrapper)).toEqual([
      "ui_kit.buttons.clear_field(ui_kit.date_range_input.start_date)",
      "ui_kit.accessibility.open_calendar_for(ui_kit.date_range_input.start_date)",
      "ui_kit.buttons.clear_field(ui_kit.date_range_input.end_date)",
      "ui_kit.accessibility.open_calendar_for(ui_kit.date_range_input.end_date)",
    ]);
  });
});
