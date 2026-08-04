import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcInputDetails, VcLabel } from "@/ui-kit/components/atoms";
import VcDatePicker from "../date-picker/vc-date-picker.vue";
import VcDateRangePicker from "./vc-date-range-picker.vue";
import type { DOMWrapper, VueWrapper } from "@vue/test-utils";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcCalendar from "@/ui-kit/components/molecules/calendar/vc-calendar.vue";
import VcRangeCalendar from "@/ui-kit/components/molecules/calendar/vc-range-calendar.vue";
import VcDateInput from "@/ui-kit/components/molecules/date-input/vc-date-input.vue";
import VcDateRangeInput from "@/ui-kit/components/molecules/date-range-input/vc-date-range-input.vue";
import VcInput from "@/ui-kit/components/molecules/input/vc-input.vue";
import VcPopover from "@/ui-kit/components/molecules/popover/vc-popover.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }) }));

// Globally registered in the app; mount() needs the real open/close chain, so only leaf atoms are stubbed.
const stubs = { VcLabel: true, VcIcon: true, VcTooltip: true };

function mountPicker(props = {}, options: { attachTo?: Element } = {}) {
  return mount(VcDateRangePicker, {
    props: { modelValue: undefined, ...props },
    global: {
      components: {
        VcDateInput,
        VcInput,
        VcInputDetails,
        VcButton,
        VcPopover,
        VcRangeCalendar,
        VcDateRangeInput,
        VcDatePicker,
      },
      stubs,
      directives: { "html-safe": {} },
    },
    ...options,
  });
}

// "split" nests two whole VcDatePickers, and VcLabel stays real so startLabel/endLabel render.
function mountSplit(props = {}, options: { attachTo?: Element } = {}) {
  return mount(VcDateRangePicker, {
    props: {
      modelValue: undefined,
      layout: "split",
      startLabel: "Start date",
      endLabel: "End date",
      ...props,
    },
    global: {
      // Unrendered "combined" branch, but the compiled template resolves every component up front.
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
    ...options,
  });
}

describe("VcDateRangePicker", () => {
  it("renders a VcDateRangeInput and forwards the range value", () => {
    const wrapper = mountPicker({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
    const input = wrapper.findComponent({ name: "VcDateRangeInput" });
    expect(input.exists()).toBe(true);
    expect(input.props("modelValue")).toEqual({ start: "2026-10-08", end: "2026-10-14" });
  });

  it("re-emits update:modelValue from the input", async () => {
    const wrapper = mountPicker();
    wrapper.findComponent({ name: "VcDateRangeInput" }).vm.$emit("update:modelValue", { start: "2026-10-08" });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08" });
  });

  it("re-emits update:valid from the input", async () => {
    const wrapper = mountPicker();
    wrapper.findComponent({ name: "VcDateRangeInput" }).vm.$emit("update:valid", false);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
  });

  it("keeps the popover open when the calendar emits an anchor-only partial range", async () => {
    const wrapper = mountPicker({}, { attachTo: document.body });

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    const bodyBefore = wrapper.find(".vc-popover__body");
    expect(bodyBefore.attributes("style")).toContain("display: block");

    wrapper.findComponent({ name: "VcRangeCalendar" }).vm.$emit("update:modelValue", { start: "2026-10-08" });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08" });
    const bodyAfter = wrapper.find(".vc-popover__body");
    expect(bodyAfter.attributes("style")).toContain("display: block");

    wrapper.unmount();
  });

  it("closes the popover and returns focus to the start segment when the calendar emits a complete range", async () => {
    const wrapper = mountPicker({}, { attachTo: document.body });

    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    const bodyBefore = wrapper.find(".vc-popover__body");
    expect(bodyBefore.attributes("style")).toContain("display: block");

    wrapper
      .findComponent({ name: "VcRangeCalendar" })
      .vm.$emit("update:modelValue", { start: "2026-10-08", end: "2026-10-14" });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: "2026-10-14" });
    const bodyAfter = wrapper.find(".vc-popover__body");
    expect(bodyAfter.attributes("style")).toContain("display: none");

    const [startInput] = wrapper.findAllComponents({ name: "VcDateInput" });
    expect(document.activeElement).toBe(startInput.find("input").element);

    wrapper.unmount();
  });

  it("defaults to the combined layout", () => {
    const wrapper = mountPicker();
    expect(wrapper.props("layout")).toBe("combined");
    expect(wrapper.classes()).toContain("vc-date-range-picker--layout--combined");
    expect(wrapper.findComponent({ name: "VcDateRangeInput" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "VcDatePicker" }).exists()).toBe(false);
  });
});

describe("VcDateRangePicker — split layout", () => {
  it("renders two VcDatePicker fields instead of the combined input", () => {
    const wrapper = mountSplit();
    expect(wrapper.findAllComponents({ name: "VcDatePicker" })).toHaveLength(2);
    expect(wrapper.findComponent({ name: "VcDateRangeInput" }).exists()).toBe(false);
  });

  it("turns startLabel/endLabel into visible labels bound to their own input", () => {
    const wrapper = mountSplit();
    const labels = wrapper.findAll("label");
    expect(labels.map((label) => label.text())).toEqual(["Start date", "End date"]);

    const inputs = wrapper.findAll("input");
    expect(labels[0].attributes("for")).toBe(inputs[0].attributes("id"));
    expect(labels[1].attributes("for")).toBe(inputs[1].attributes("id"));
  });

  it("renders one calendar trigger per field", () => {
    const wrapper = mountSplit();
    const triggers = wrapper.findAll('button[aria-label="ui_kit.accessibility.open_calendar"]');
    expect(triggers).toHaveLength(2);
  });

  it("renders exactly one details row for the whole row of fields", () => {
    const wrapper = mountSplit({ error: true, message: "external" });
    const details = wrapper.findAllComponents(VcInputDetails);
    expect(details).toHaveLength(1);
    expect(details[0].props("message")).toBe("external");
  });

  it("exposes the row as a labelled group", () => {
    const wrapper = mountSplit({ label: "Order date range" });
    const group = wrapper.find('[role="group"]');
    expect(group.exists()).toBe(true);
    expect(group.attributes("aria-label")).toBe("Order date range");
  });

  it("falls back to the generic group label when no label is given", () => {
    const wrapper = mountSplit();
    expect(wrapper.find('[role="group"]').attributes("aria-label")).toBe("ui_kit.date_range_input.aria_label");
  });

  describe("cross-bound calendars", () => {
    function calendarBounds(wrapper: ReturnType<typeof mountSplit>) {
      const [start, end] = wrapper.findAllComponents(VcCalendar);
      return {
        startMax: start.props("max"),
        startMin: start.props("min"),
        endMin: end.props("min"),
        endMax: end.props("max"),
      };
    }

    it("clamps each calendar to the opposite endpoint", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
      const bounds = calendarBounds(wrapper);
      expect(bounds.startMax).toBe("2026-10-14");
      expect(bounds.endMin).toBe("2026-10-08");
    });

    it("keeps the narrower of props.max and the end value", () => {
      const wrapper = mountSplit({
        modelValue: { start: "2026-10-08", end: "2026-10-25" },
        min: "2026-10-05",
        max: "2026-10-20",
      });
      const bounds = calendarBounds(wrapper);
      expect(bounds.startMax).toBe("2026-10-20");
      expect(bounds.startMin).toBe("2026-10-05");
    });

    it("keeps the narrower of props.min and the start value", () => {
      const wrapper = mountSplit({
        modelValue: { start: "2026-10-08", end: "2026-10-25" },
        min: "2026-10-12",
        max: "2026-10-30",
      });
      const bounds = calendarBounds(wrapper);
      expect(bounds.endMin).toBe("2026-10-12");
      expect(bounds.endMax).toBe("2026-10-30");
    });

    it("falls back to props.min/props.max when the opposite endpoint is empty", () => {
      const wrapper = mountSplit({ modelValue: undefined, min: "2026-10-05", max: "2026-10-25" });
      const bounds = calendarBounds(wrapper);
      expect(bounds.startMax).toBe("2026-10-25");
      expect(bounds.endMin).toBe("2026-10-05");
    });

    it("leaves both calendars unbounded when neither props nor the range constrain them", () => {
      const wrapper = mountSplit();
      const bounds = calendarBounds(wrapper);
      expect(bounds.startMax).toBeUndefined();
      expect(bounds.endMin).toBeUndefined();
    });

    it("uses the opposite endpoint alone when the matching prop boundary is absent", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" }, min: undefined });
      const bounds = calendarBounds(wrapper);
      expect(bounds.endMin).toBe("2026-10-08");
    });

    it("recomputes the boundaries when the range changes", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
      await wrapper.setProps({ modelValue: { start: "2026-10-08", end: "2026-10-20" } });
      expect(calendarBounds(wrapper).startMax).toBe("2026-10-20");
    });

    // Clamping here would disable every day of the month the calendar opens on.
    describe("already out of order", () => {
      const outOfOrder = { start: "2026-12-01", end: "2026-10-14" };

      function enabledDayCount(calendar: DOMWrapper<Element> | VueWrapper): number {
        const cells = calendar.findAll("[data-reka-calendar-cell-trigger]:not([data-outside-view])");
        return cells.filter(
          (cell) => cell.attributes("data-disabled") === undefined && cell.attributes("aria-disabled") !== "true",
        ).length;
      }

      it("drops the cross-bound clamp entirely when no caller boundary applies", () => {
        const bounds = calendarBounds(mountSplit({ modelValue: outOfOrder }));
        expect(bounds.startMax).toBeUndefined();
        expect(bounds.endMin).toBeUndefined();
      });

      it("falls back to the caller's own boundaries rather than the opposite endpoint", () => {
        const bounds = calendarBounds(mountSplit({ modelValue: outOfOrder, min: "2026-01-01", max: "2027-12-31" }));
        expect(bounds.startMax).toBe("2027-12-31");
        expect(bounds.endMin).toBe("2026-01-01");
      });

      it("leaves every day of the month each calendar opens on selectable, in both directions", () => {
        const wrapper = mountSplit({ modelValue: outOfOrder });
        const [startCalendar, endCalendar] = wrapper.findAllComponents(VcCalendar);
        expect(enabledDayCount(startCalendar)).toBe(31);
        expect(enabledDayCount(endCalendar)).toBe(31);
      });

      it("restores the clamp as soon as the range is back in order", async () => {
        const wrapper = mountSplit({ modelValue: outOfOrder });
        await wrapper.setProps({ modelValue: { start: "2026-10-01", end: "2026-10-14" } });
        const bounds = calendarBounds(wrapper);
        expect(bounds.startMax).toBe("2026-10-14");
        expect(bounds.endMin).toBe("2026-10-01");
      });
    });
  });

  describe("range order validity", () => {
    it("seeds update:valid=true for an empty range on mount", () => {
      const wrapper = mountSplit();
      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(true);
    });

    it("flips update:valid to false when the committed end precedes the start", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-20", end: undefined } });
      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(true);

      await wrapper.setProps({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
    });

    it("surfaces invalid_range exactly once for an out-of-order range", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
      const details = wrapper.findAllComponents(VcInputDetails);
      expect(details).toHaveLength(1);
      expect(details[0].props("message")).toBe("ui_kit.date_range_input.invalid_range");
    });

    it("reports a segment's format error through the shared details row", async () => {
      const wrapper = mountSplit();
      const [startField] = wrapper.findAllComponents({ name: "VcDatePicker" });
      startField.vm.$emit("update:valid", false);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(false);
      expect(wrapper.findComponent(VcInputDetails).props("message")).toBe("ui_kit.date_input.invalid_format");
    });
  });

  describe("model merging", () => {
    it("emits a merged range when the start field commits", async () => {
      const wrapper = mountSplit({ modelValue: { start: undefined, end: "2026-10-14" } });
      const [startField] = wrapper.findAllComponents({ name: "VcDatePicker" });
      startField.vm.$emit("update:modelValue", "2026-10-08");
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: "2026-10-14" });
    });

    it("emits a merged range when the end field commits", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: undefined } });
      const [, endField] = wrapper.findAllComponents({ name: "VcDatePicker" });
      endField.vm.$emit("update:modelValue", "2026-10-14");
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: "2026-10-14" });
    });

    it("collapses to undefined once both fields are cleared", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" }, clearable: true });
      const [startField, endField] = wrapper.findAllComponents({ name: "VcDatePicker" });

      startField.vm.$emit("update:modelValue", undefined);
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: undefined, end: "2026-10-14" });

      await wrapper.setProps({ modelValue: { start: undefined, end: "2026-10-14" } });
      endField.vm.$emit("update:modelValue", undefined);
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBeUndefined();
    });

    it("re-emits clear from either field", async () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-08", end: "2026-10-14" }, clearable: true });
      const [startField, endField] = wrapper.findAllComponents({ name: "VcDatePicker" });

      startField.vm.$emit("clear");
      endField.vm.$emit("clear");
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("clear")).toHaveLength(2);
    });
  });

  it("marks both fields when the external error prop is set", () => {
    const wrapper = mountSplit({ error: true, message: "external" });
    const fields = wrapper.findAllComponents({ name: "VcDatePicker" });
    expect(fields.map((field) => field.props("error"))).toEqual([true, true]);
    expect(fields.every((field) => field.props("hideDetails"))).toBe(true);
  });

  describe("shared details a11y wiring", () => {
    it("points both inputs at the shared details row and marks them invalid", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-20", end: "2026-10-01" } });
      const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");
      expect(detailsId).toBeTruthy();

      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-describedby"))).toEqual([detailsId, detailsId]);
      expect(inputs.map((input) => input.attributes("aria-invalid"))).toEqual(["true", "true"]);
    });

    it("describes both inputs for a plain external message too", () => {
      const wrapper = mountSplit({ message: "pick a range" });
      const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");
      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-describedby"))).toEqual([detailsId, detailsId]);
      expect(inputs.map((input) => input.attributes("aria-invalid"))).toEqual(["false", "false"]);
    });

    it("leaves aria-describedby off when there is nothing to describe", () => {
      const wrapper = mountSplit({ modelValue: { start: "2026-10-01", end: "2026-10-20" } });
      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-describedby"))).toEqual([undefined, undefined]);
      expect(inputs.map((input) => input.attributes("aria-invalid"))).toEqual(["false", "false"]);
    });

    it("keeps VcDatePicker's own combobox wiring on the inputs", () => {
      const wrapper = mountSplit({ message: "pick a range" });
      const [startInput] = wrapper.findAll("input");
      expect(startInput.attributes("role")).toBe("combobox");
      expect(startInput.attributes("aria-expanded")).toBe("false");
    });
  });

  describe("focus/blur shell boundary", () => {
    it("emits focus exactly once when focus enters the row from outside", () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      outside.focus();

      const wrapper = mountSplit({}, { attachTo: document.body });
      const [startInput] = wrapper.findAll("input");
      startInput.element.focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toBeUndefined();

      wrapper.unmount();
      outside.remove();
    });

    it("emits nothing when focus moves between the two fields", () => {
      const wrapper = mountSplit({}, { attachTo: document.body });
      const [startInput, endInput] = wrapper.findAll("input");

      startInput.element.focus();
      expect(wrapper.emitted("focus")).toHaveLength(1);

      endInput.element.focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toBeUndefined();

      wrapper.unmount();
    });

    it("emits nothing when focus moves from a field to its own calendar trigger", () => {
      const wrapper = mountSplit({}, { attachTo: document.body });
      const [startInput] = wrapper.findAll("input");
      const [startTrigger] = wrapper.findAll('button[aria-label="ui_kit.accessibility.open_calendar"]');

      startInput.element.focus();
      (startTrigger.element as HTMLButtonElement).focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toBeUndefined();

      wrapper.unmount();
    });

    it("emits blur exactly once when focus leaves the row", () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);

      const wrapper = mountSplit({}, { attachTo: document.body });
      const [startInput] = wrapper.findAll("input");

      startInput.element.focus();
      outside.focus();

      expect(wrapper.emitted("focus")).toHaveLength(1);
      expect(wrapper.emitted("blur")).toHaveLength(1);

      wrapper.unmount();
      outside.remove();
    });
  });

  describe("per-side and root wiring", () => {
    it("renders a single required asterisk, on the group label", () => {
      const wrapper = mountSplit({ label: "Order date range", required: true });
      expect(wrapper.findAll(".vc-label__asterisk")).toHaveLength(1);
      expect(wrapper.findAllComponents({ name: "VcDatePicker" }).map((field) => field.props("required"))).toEqual([
        false,
        false,
      ]);
    });

    it("keeps the required semantics on both inputs even though only the group shows an asterisk", () => {
      const wrapper = mountSplit({ label: "Order date range", required: true });
      const inputs = wrapper.findAll("input");
      expect(inputs.map((input) => input.attributes("aria-required"))).toEqual(["true", "true"]);
    });

    it("leaves aria-required off both inputs when the range is optional", () => {
      const inputs = mountSplit({ label: "Order date range" }).findAll("input");
      expect(inputs.map((input) => input.attributes("aria-required"))).toEqual([undefined, undefined]);
    });

    it("opens the start calendar start-aligned so it does not overhang the separator", () => {
      const [startField, endField] = mountSplit().findAllComponents({ name: "VcDatePicker" });
      expect(startField.props("placement")).toBe("bottom-start");
      expect(endField.props("placement")).toBe("bottom-end");
    });

    it("keeps the caller's vertical side on both fields for a non-default placement", () => {
      const [startField, endField] = mountSplit({ placement: "top-end" }).findAllComponents({ name: "VcDatePicker" });
      expect(startField.props("placement")).toBe("top-start");
      expect(endField.props("placement")).toBe("top-end");
    });

    it("puts dataTestId on the row root as well as the two fields", () => {
      const wrapper = mountSplit({ dataTestId: "order-date" });
      expect(wrapper.find('[role="group"]').attributes("data-test-id")).toBe("order-date");
      expect(wrapper.findAllComponents({ name: "VcDatePicker" }).map((field) => field.props("dataTestId"))).toEqual([
        "order-date-start",
        "order-date-end",
      ]);
    });

    it("leaves the per-side names and test ids undefined when the base value is absent", () => {
      const fields = mountSplit().findAllComponents({ name: "VcDatePicker" });
      expect(fields.map((field) => field.props("name"))).toEqual([undefined, undefined]);
      expect(fields.map((field) => field.props("dataTestId"))).toEqual([undefined, undefined]);
    });
  });
});
