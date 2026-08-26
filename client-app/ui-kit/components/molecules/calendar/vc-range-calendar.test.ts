import { CalendarDate } from "@internationalized/date";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { todayDate } from "./use-calendar-base";
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

// The bug only reproduces through a real v-model round trip: the emitted value must flow back as a prop.
function mountBoundCal(initial: VcDateRangeType | undefined) {
  const state = ref<VcDateRangeType | undefined>(initial);
  const emits: (VcDateRangeType | undefined)[] = [];

  const Parent = defineComponent({
    setup() {
      return () =>
        h(VcRangeCalendar, {
          modelValue: state.value,
          "onUpdate:modelValue": (value: VcDateRangeType | undefined) => {
            state.value = value;
            emits.push(value);
          },
        });
    },
  });

  const wrapper = mount(Parent, { global: { stubs: { VcIcon: true } }, attachTo: document.body });
  return { wrapper, state, emits };
}

// reka only builds a range from a real pointer path — a bare click leaves highlightedRange null.
async function clickDay(iso: string): Promise<void> {
  const cell = document.querySelector<HTMLElement>(
    `[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`,
  );
  if (!cell) {
    throw new Error(`no in-view cell for ${iso}`);
  }
  cell.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
  await flushPromises();
  cell.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await flushPromises();
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
  it("maps a VcDateRangeType modelValue into reka DateValue range", () => {
    const wrapper = mountCal();
    const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
    const mv = root.props("modelValue") as { start?: CalendarDate; end?: CalendarDate };
    expect(mv.start?.toString()).toBe("2026-10-08");
    expect(mv.end?.toString()).toBe("2026-10-14");
  });

  it("emits VcDateRangeType ISO strings on reka update", async () => {
    const wrapper = mountCal({ modelValue: undefined });
    const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
    root.vm.$emit("update:modelValue", { start: new CalendarDate(2026, 10, 8), end: new CalendarDate(2026, 10, 14) });
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted?.at(-1)?.[0]).toEqual({ start: "2026-10-08", end: "2026-10-14" });
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

  // Uncontrolled host: the prop never comes back, so the dedup snapshot is the only record of the last
  // emit. It must not swallow the completed range that follows the anchor.
  it("keeps emitting when the host never applies the emitted value", async () => {
    const anchor = todayDate().set({ day: 10 }).toString();
    const completion = todayDate().set({ day: 20 }).toString();
    const wrapper = mountCal({ modelValue: undefined }, { attachTo: document.body });

    await clickDay(anchor);
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: anchor, end: undefined });

    await clickDay(completion);
    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({ start: anchor, end: completion });

    wrapper.unmount();
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

  describe("end-only range", () => {
    it("does not re-anchor an initial end-only range on mount", async () => {
      const { wrapper, state, emits } = mountBoundCal({ start: undefined, end: "2026-10-14" });
      await flushPromises();

      expect(emits).toEqual([]);
      expect(state.value).toEqual({ start: undefined, end: "2026-10-14" });

      wrapper.unmount();
    });

    it("keeps the existing end when picking an earlier start", async () => {
      const { wrapper, state, emits } = mountBoundCal({ start: undefined, end: "2026-10-14" });
      await flushPromises();

      await clickDay("2026-10-08");

      expect(state.value).toEqual({ start: "2026-10-08", end: "2026-10-14" });
      expect(emits.at(-1)).toEqual({ start: "2026-10-08", end: "2026-10-14" });
      expect(emits).not.toContainEqual({ start: "2026-10-08", end: undefined });

      wrapper.unmount();
    });

    it("keeps the existing end when picking a later date", async () => {
      const { wrapper, state, emits } = mountBoundCal({ start: undefined, end: "2026-10-14" });
      await flushPromises();

      await clickDay("2026-10-20");

      expect(state.value).toEqual({ start: "2026-10-14", end: "2026-10-20" });
      expect(emits).not.toContainEqual({ start: "2026-10-20", end: undefined });

      wrapper.unmount();
    });

    it("focuses the end endpoint when there is no start", async () => {
      const wrapper = mountCal({ modelValue: { start: undefined, end: "2026-10-14" } }, { attachTo: document.body });
      await flushPromises();

      wrapper.vm.focusActiveCell();
      expect(activeCellIso()).toBe("2026-10-14");

      wrapper.unmount();
    });
  });

  describe("placeholder clamping to [min, max]", () => {
    function inViewCell(wrapper: ReturnType<typeof mountCal>, iso: string) {
      return wrapper.find(`[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`);
    }

    it("opens on the max month instead of today's fully-disabled month when max is in the past", () => {
      const wrapper = mountCal({ modelValue: undefined, max: "2020-06-15" });
      const maxCell = inViewCell(wrapper, "2020-06-15");
      expect(maxCell.exists()).toBe(true);
      expect(maxCell.attributes("data-disabled")).toBeUndefined();
    });

    it("keeps the view in bounds when a clear re-seeds the placeholder to today", async () => {
      const wrapper = mountCal({ modelValue: { start: "2020-05-01", end: "2020-06-01" }, max: "2020-06-15" });
      await wrapper.setProps({ modelValue: undefined });
      await flushPromises();
      expect(inViewCell(wrapper, "2020-06-15").exists()).toBe(true);
    });

    it("opens on the min month when min is in the future", () => {
      const wrapper = mountCal({ modelValue: undefined, min: "2030-03-10" });
      const minCell = inViewCell(wrapper, "2030-03-10");
      expect(minCell.exists()).toBe(true);
      expect(minCell.attributes("data-disabled")).toBeUndefined();
    });
  });

  describe("placeholder preference on external model changes", () => {
    it("renders the start month when both endpoints change, matching reka's start preference", async () => {
      const wrapper = mountCal({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
      await wrapper.setProps({ modelValue: { start: "2027-02-03", end: "2027-05-20" } });
      await flushPromises();
      expect(
        wrapper.find('[data-reka-calendar-cell-trigger][data-value="2027-02-03"]:not([data-outside-view])').exists(),
      ).toBe(true);
    });

    it("renders the end month on an end-only external change", async () => {
      const wrapper = mountCal({ modelValue: { start: "2026-10-08", end: "2026-10-14" } });
      await wrapper.setProps({ modelValue: { start: "2026-10-08", end: "2027-05-20" } });
      await flushPromises();
      expect(
        wrapper.find('[data-reka-calendar-cell-trigger][data-value="2027-05-20"]:not([data-outside-view])').exists(),
      ).toBe(true);
    });
  });

  describe("Escape during an in-progress pick", () => {
    function inViewCellElement(iso: string): HTMLElement | null {
      return document.querySelector<HTMLElement>(
        `[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`,
      );
    }

    function pressEscape(el: HTMLElement): void {
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    }

    // reka restores startValue and endValue separately: forwarding the start half alone left the model
    // half-reverted — neither the committed range nor the new anchor.
    it("restores the whole committed range in a single emit", async () => {
      const { wrapper, state, emits } = mountBoundCal({ start: "2026-10-08", end: "2026-10-14" });
      await flushPromises();

      await clickDay("2026-10-20");
      expect(state.value).toEqual({ start: "2026-10-20", end: undefined });
      const emitCountAfterPick = emits.length;

      const cell = inViewCellElement("2026-10-20")!;
      pressEscape(cell);
      await flushPromises();

      expect(emits.slice(emitCountAfterPick)).toEqual([{ start: "2026-10-08", end: "2026-10-14" }]);
      expect(state.value).toEqual({ start: "2026-10-08", end: "2026-10-14" });

      // reka's internals must agree with the restored model, not stay on the abandoned anchor.
      expect(cell.dataset.selectionStart).toBeUndefined();
      expect(inViewCellElement("2026-10-08")?.dataset.selectionStart).toBeDefined();
      expect(inViewCellElement("2026-10-14")?.dataset.selectionEnd).toBeDefined();

      wrapper.unmount();
    });

    it("discards the anchor when there is no committed range to fall back on", async () => {
      const { wrapper, state } = mountBoundCal(undefined);
      await flushPromises();

      // An empty calendar opens on today's month, the only month with clickable in-view cells.
      const anchor = todayDate().toString();
      await clickDay(anchor);
      expect(state.value).toEqual({ start: anchor, end: undefined });

      pressEscape(inViewCellElement(anchor)!);
      await flushPromises();

      expect(state.value).toBeUndefined();

      wrapper.unmount();
    });

    // The guard must not depend on a tick count: jsdom flushes reka's revert on the next microtask,
    // a real browser lands it a whole task later, which used to let the start-only half through.
    it("swallows the start-only half however late reka's revert lands", async () => {
      const wrapper = mountCal({ modelValue: { start: "2026-10-20", end: undefined } });

      wrapper.element.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await flushPromises();
      await flushPromises();
      await new Promise((resolve) => setTimeout(resolve, 10));

      const root = wrapper.findComponent({ name: "RangeCalendarRoot" });
      root.vm.$emit("update:startValue", new CalendarDate(2026, 10, 8));
      root.vm.$emit("update:modelValue", { start: new CalendarDate(2026, 10, 8), end: new CalendarDate(2026, 10, 14) });
      await flushPromises();

      expect(wrapper.emitted("update:modelValue")?.map((call) => call[0])).toEqual([
        { start: "2026-10-08", end: "2026-10-14" },
      ]);

      wrapper.unmount();
    });

    it("does not swallow the next anchor pick after an Escape with nothing to revert", async () => {
      const { wrapper, state } = mountBoundCal({ start: "2026-10-08", end: "2026-10-14" });
      await flushPromises();

      pressEscape(inViewCellElement("2026-10-08")!);
      await flushPromises();

      await clickDay("2026-10-20");
      expect(state.value).toEqual({ start: "2026-10-20", end: undefined });

      wrapper.unmount();
    });

    it("emits nothing when Escape arrives with no pick in progress", async () => {
      const { wrapper, emits } = mountBoundCal({ start: "2026-10-08", end: "2026-10-14" });
      await flushPromises();

      pressEscape(inViewCellElement("2026-10-08")!);
      await flushPromises();

      expect(emits).toHaveLength(0);

      wrapper.unmount();
    });
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
