import { CalendarDate } from "@internationalized/date";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import VcRangeCalendar from "./vc-range-calendar.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
}));

function mountCal(props = {}, options: { attachTo?: Element } = {}) {
  return mount(VcRangeCalendar, {
    props: { modelValue: { start: "2026-10-08", end: "2026-10-14" }, ...props },
    global: { stubs: { VcIcon: true } },
    ...options,
  });
}

// vue-test-utils' `trigger` doesn't hand back the event, so `defaultPrevented` isn't observable.
function pressKey(el: Element, key: string, modifiers: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...modifiers });
  el.dispatchEvent(event);
  return event;
}

function activeCellIso(): string | undefined {
  return (document.activeElement as HTMLElement | null)?.dataset.value;
}

describe("VcRangeCalendar", () => {
  it("maps a VcDateRange modelValue into reka DateValue range", () => {
    const wrapper = mountCal();
    const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
    const mv = root.props("modelValue") as { start?: CalendarDate; end?: CalendarDate };
    expect(mv.start?.toString()).toBe("2026-10-08");
    expect(mv.end?.toString()).toBe("2026-10-14");
  });

  it("emits VcDateRange ISO strings on reka update", async () => {
    const wrapper = mountCal({ modelValue: undefined });
    const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
    root.vm.$emit("update:modelValue", { start: new CalendarDate(2026, 10, 8), end: new CalendarDate(2026, 10, 14) });
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: "2026-10-14" });
  });

  it("emits update:valid=true for an empty range", () => {
    const wrapper = mountCal({ modelValue: undefined });
    expect(wrapper.emitted("update:valid")?.at(-1)?.[0]).toBe(true);
  });

  it("emits a partial range on anchor pick (reka update:startValue)", async () => {
    const wrapper = mountCal({ modelValue: undefined });
    const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
    root.vm.$emit("update:startValue", new CalendarDate(2026, 10, 8));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: undefined });
  });

  it("re-anchors on the same start date when a committed range already exists", async () => {
    const wrapper = mountCal({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
    const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
    root.vm.$emit("update:startValue", new CalendarDate(2026, 10, 8));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: undefined });
  });

  it("does not re-emit update:modelValue when reka echoes the committed range unchanged", async () => {
    const wrapper = mountCal({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
    const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
    root.vm.$emit("update:modelValue", { start: new CalendarDate(2026, 10, 8), end: new CalendarDate(2026, 10, 14) });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("emits exactly once when reka fires update:startValue and update:modelValue back-to-back in the same tick", async () => {
    const wrapper = mountCal({ modelValue: undefined });
    const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
    root.vm.$emit("update:startValue", new CalendarDate(2026, 10, 8));
    root.vm.$emit("update:modelValue", { start: new CalendarDate(2026, 10, 8), end: undefined });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual({ start: "2026-10-08", end: undefined });
  });

  it("keeps the swapped complete range when picking a date earlier than the anchor", async () => {
    // Real reka sequence: swap-commit, then a trailing update:startValue echo for the same start.
    const wrapper = mountCal({ modelValue: { start: "2026-10-20", end: undefined } });
    const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
    root.vm.$emit("update:modelValue", { start: new CalendarDate(2026, 10, 10), end: new CalendarDate(2026, 10, 20) });
    root.vm.$emit("update:startValue", new CalendarDate(2026, 10, 10));
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted?.at(-1)?.[0]).toEqual({ start: "2026-10-10", end: "2026-10-20" });
  });

  it("does not re-attribute an external end-only range to start", async () => {
    // reka rewrites an end-only range as a fresh start anchor; forwarding that echo moves end into start.
    const wrapper = mountCal({ modelValue: undefined });
    await flushPromises();

    await wrapper.setProps({ modelValue: { start: undefined, end: "2026-10-14" } });
    await flushPromises();

    const startAttributed = wrapper
      .emitted("update:modelValue")
      ?.some((call) => (call[0] as { start?: string } | undefined)?.start === "2026-10-14");
    expect(startAttributed).toBeFalsy();
  });

  describe("keyboard navigation (Home/End/PageUp/PageDown)", () => {
    // Oct 8, 2026 is a Thursday; week-starts-on Monday puts the week span at Oct 5–11.
    it("moves focus by week/month and scrolls the view across a month boundary", async () => {
      const wrapper = mountCal(
        { modelValue: { start: "2026-10-08", end: undefined }, firstDayOfWeek: 1 },
        { attachTo: document.body },
      );
      wrapper.vm.focusActiveCell();
      expect(activeCellIso()).toBe("2026-10-08");

      const root = wrapper.find('[role="group"]').element;

      const homeEvent = pressKey(root, "Home");
      await flushPromises();
      expect(activeCellIso()).toBe("2026-10-05");
      expect(homeEvent.defaultPrevented).toBe(true);

      pressKey(root, "End");
      await flushPromises();
      expect(activeCellIso()).toBe("2026-10-11");

      pressKey(root, "PageDown");
      await flushPromises();
      expect(activeCellIso()).toBe("2026-11-11");

      pressKey(root, "PageUp");
      await flushPromises();
      expect(activeCellIso()).toBe("2026-10-11");

      wrapper.unmount();
    });

    it("supports ctrl (month) and shift (year) modifiers, and ignores unrelated keys", async () => {
      const wrapper = mountCal(
        { modelValue: { start: "2026-10-08", end: undefined }, firstDayOfWeek: 1 },
        { attachTo: document.body },
      );
      wrapper.vm.focusActiveCell();
      expect(activeCellIso()).toBe("2026-10-08");

      const root = wrapper.find('[role="group"]').element;

      pressKey(root, "Home", { ctrlKey: true });
      await flushPromises();
      expect(activeCellIso()).toBe("2026-10-01");

      pressKey(root, "End", { ctrlKey: true });
      await flushPromises();
      expect(activeCellIso()).toBe("2026-10-31");

      pressKey(root, "PageDown", { shiftKey: true });
      await flushPromises();
      expect(activeCellIso()).toBe("2027-10-31");

      pressKey(root, "PageUp", { shiftKey: true });
      await flushPromises();
      expect(activeCellIso()).toBe("2026-10-31");

      const unrelatedEvent = pressKey(root, "a");
      await flushPromises();
      expect(unrelatedEvent.defaultPrevented).toBe(false);
      expect(activeCellIso()).toBe("2026-10-31");

      wrapper.unmount();
    });
  });
});
