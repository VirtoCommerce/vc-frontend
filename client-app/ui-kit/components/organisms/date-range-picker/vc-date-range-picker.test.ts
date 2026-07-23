import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import VcDateRangePicker from "./vc-date-range-picker.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcRangeCalendar from "@/ui-kit/components/molecules/calendar/vc-range-calendar.vue";
import VcDateInput from "@/ui-kit/components/molecules/date-input/vc-date-input.vue";
import VcDateRangeInput from "@/ui-kit/components/molecules/date-range-input/vc-date-range-input.vue";
import VcInput from "@/ui-kit/components/molecules/input/vc-input.vue";
import VcPopover from "@/ui-kit/components/molecules/popover/vc-popover.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }) }));

// None of these are imported by the SFC itself (globally registered instead); mount() needs the
// genuine implementations for open/close + toggle-button behavior, so only leaf atoms are stubbed.
const stubs = { VcLabel: true, VcIcon: true, VcTooltip: true };

function mountPicker(props = {}, options: { attachTo?: Element } = {}) {
  return mount(VcDateRangePicker, {
    props: { modelValue: undefined, ...props },
    global: {
      components: { VcDateInput, VcInput, VcInputDetails, VcButton, VcPopover, VcRangeCalendar, VcDateRangeInput },
      stubs,
      directives: { "html-safe": {} },
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

    // Open the popover via the calendar toggle button so its content becomes visible (display: block).
    await wrapper.find('button[aria-haspopup="dialog"]').trigger("click");
    const bodyBefore = wrapper.find(".vc-popover__body");
    expect(bodyBefore.attributes("style")).toContain("display: block");

    wrapper.findComponent({ name: "VcRangeCalendar" }).vm.$emit("update:modelValue", { start: "2026-10-08" });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08" });
    // Anchor partial (no `end`) must NOT trigger the popover's close() — content stays visible.
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
    // Both endpoints committed — close() fires and content flips to display: none.
    const bodyAfter = wrapper.find(".vc-popover__body");
    expect(bodyAfter.attributes("style")).toContain("display: none");

    // Focus must return to the START segment's own input, not just "some" input.
    const [startInput] = wrapper.findAllComponents({ name: "VcDateInput" });
    expect(document.activeElement).toBe(startInput.find("input").element);

    wrapper.unmount();
  });
});
