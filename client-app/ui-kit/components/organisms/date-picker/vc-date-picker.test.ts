import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcInputDetails, VcLabel } from "@/ui-kit/components/atoms";
import VcDatePicker from "./vc-date-picker.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcCalendar from "@/ui-kit/components/molecules/calendar/vc-calendar.vue";
import VcDateInput from "@/ui-kit/components/molecules/date-input/vc-date-input.vue";
import VcInput from "@/ui-kit/components/molecules/input/vc-input.vue";
import VcPopover from "@/ui-kit/components/molecules/popover/vc-popover.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }) }));

// Globally registered in the app; mount() needs the real open/close chain, so only leaf atoms are stubbed.
function mountPicker(props = {}) {
  return mount(VcDatePicker, {
    props: { modelValue: "2026-10-08", ...props },
    global: {
      components: { VcDateInput, VcInput, VcInputDetails, VcLabel, VcButton, VcPopover, VcCalendar },
      stubs: { VcIcon: true, VcTooltip: true },
      directives: { "html-safe": {} },
    },
  });
}

function selectedDay(wrapper: ReturnType<typeof mountPicker>, iso: string) {
  return wrapper.find(`[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`);
}

describe("VcDatePicker — preventDeselect", () => {
  // A pass-through to VcCalendar that nothing in the app sets, so the false branch lives only here.
  it("keeps the value when the selected day is re-clicked", async () => {
    const wrapper = mountPicker();

    await selectedDay(wrapper, "2026-10-08").trigger("click");
    await flushPromises();

    // reka still reports the press; what matters is that it reports the same date, not an empty one.
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["2026-10-08"]);
  });

  it("clears the value on a re-click when preventDeselect is false", async () => {
    const wrapper = mountPicker({ preventDeselect: false });

    await selectedDay(wrapper, "2026-10-08").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined]);
  });

  it("forwards the flag to the calendar rather than acting on it itself", () => {
    expect(mountPicker().findComponent(VcCalendar).props("preventDeselect")).toBe(true);
    expect(mountPicker({ preventDeselect: false }).findComponent(VcCalendar).props("preventDeselect")).toBe(false);
  });
});

describe("VcDatePicker — footer Clear", () => {
  // An uncontrolled parent never writes the emit back, so a resync would repaint the cleared date.
  it("empties the field even when the parent never applies the clear", async () => {
    const wrapper = mountPicker({ showFooter: true });

    await wrapper.find(".vc-calendar__footer-btn--ghost").trigger("click");
    await flushPromises();

    expect(wrapper.find("input").element.value).toBe("");
  });

  it("emits clear alongside the model change", async () => {
    const wrapper = mountPicker({ showFooter: true });

    await wrapper.find(".vc-calendar__footer-btn--ghost").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("clear")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined]);
  });

  it("stays put when the field is readonly", async () => {
    const wrapper = mountPicker({ showFooter: true, readonly: true });

    await wrapper.find(".vc-calendar__footer-btn--ghost").trigger("click");
    await flushPromises();

    expect(wrapper.emitted("clear")).toBeUndefined();
    expect(wrapper.find("input").element.value).not.toBe("");
  });
});
