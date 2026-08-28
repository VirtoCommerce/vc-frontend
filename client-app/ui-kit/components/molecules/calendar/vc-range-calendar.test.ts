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
function mountBoundCal(initial: VcDateRangeType | undefined, props: Record<string, unknown> = {}) {
  const state = ref<VcDateRangeType | undefined>(initial);
  const emits: (VcDateRangeType | undefined)[] = [];

  const Parent = defineComponent({
    setup() {
      return () =>
        h(VcRangeCalendar, {
          ...props,
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

  describe("unavailable days inside a range", () => {
    // Sat 2026-10-10 and Sun 2026-10-11 sit between the two work weeks.
    const weekends = (iso: string) => [0, 6].includes(new Date(`${iso}T00:00:00Z`).getUTCDay());

    it("completes a range that stays clear of unavailable days", async () => {
      const { wrapper, state } = mountBoundCal({ start: "2026-10-05", end: undefined }, { disabledDate: weekends });
      await flushPromises();

      await clickDay("2026-10-09");

      expect(state.value).toEqual({ start: "2026-10-05", end: "2026-10-09" });

      wrapper.unmount();
    });

    // Without allow-non-contiguous-ranges reka swallows this click and the repeat press re-anchors,
    // so the range can never be made — the whole reason the prop is set.
    it("completes a range that spans an unavailable day", async () => {
      const { wrapper, state, emits } = mountBoundCal(
        { start: "2026-10-05", end: undefined },
        { disabledDate: weekends },
      );
      await flushPromises();

      await clickDay("2026-10-12");

      expect(emits).toEqual([{ start: "2026-10-05", end: "2026-10-12" }]);
      expect(state.value).toEqual({ start: "2026-10-05", end: "2026-10-12" });

      wrapper.unmount();
    });

    it("completes a backwards span across an unavailable day", async () => {
      const { wrapper, state } = mountBoundCal({ start: "2026-10-12", end: undefined }, { disabledDate: weekends });
      await flushPromises();

      await clickDay("2026-10-05");

      expect(state.value).toEqual({ start: "2026-10-05", end: "2026-10-12" });

      wrapper.unmount();
    });

    // Spanning one is allowed; landing on one is not.
    it("still refuses an unavailable day as an endpoint", async () => {
      const { wrapper, state, emits } = mountBoundCal(undefined, { disabledDate: weekends });
      await flushPromises();

      const cell = document.querySelector<HTMLElement>(
        "[data-reka-calendar-cell-trigger][data-unavailable]:not([data-outside-view])",
      );
      expect(cell?.getAttribute("aria-disabled")).toBe("true");
      cell?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      expect(emits).toEqual([]);
      expect(state.value).toBeUndefined();

      wrapper.unmount();
    });

    // The band has to read as continuous, with the spanned days keeping their own cue.
    it("marks the spanned unavailable days as both in-range and unavailable", async () => {
      const { wrapper } = mountBoundCal({ start: "2026-10-05", end: "2026-10-12" }, { disabledDate: weekends });
      await flushPromises();

      const inBand = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-reka-calendar-cell-trigger][data-selected]:not([data-outside-view])",
        ),
      ).map((cell) => cell.dataset.value);
      expect(inBand).toEqual([
        "2026-10-05",
        "2026-10-06",
        "2026-10-07",
        "2026-10-08",
        "2026-10-09",
        "2026-10-10",
        "2026-10-11",
        "2026-10-12",
      ]);
      expect(document.querySelector('[data-value="2026-10-10"][data-selected][data-unavailable]')).not.toBeNull();

      wrapper.unmount();
    });
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

  // reka deselects an endpoint that is picked twice; here that silently dropped a committed date.
  describe("re-picking an endpoint", () => {
    // reka only reaches its deselect branch when highlightedRange is null, which needs a click with no
    // hover and no focus — the helpers that send mouseenter first bypass the branch entirely, so a test
    // built on them cannot tell whether prevent-deselect is set at all.
    it("keeps the anchor on a bare click, with no hover to build a highlighted range", async () => {
      const { wrapper, state } = mountBoundCal({ start: "2026-10-08", end: undefined });
      await flushPromises();

      const cell = document.querySelector<HTMLElement>(
        `[data-reka-calendar-cell-trigger][data-value="2026-10-08"]:not([data-outside-view])`,
      )!;
      cell.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await flushPromises();

      expect(state.value).toEqual({ start: "2026-10-08", end: undefined });

      wrapper.unmount();
    });

    // reka reads cell keys from `event.code`, not `event.key`, and acts on the focused day — a bare
    // `key` on an unfocused cell reaches nothing, and asserting `.start` alone cannot tell "anchor
    // kept" from "collapsed into a single-day range".
    it("closes the anchor into a single-day range from the keyboard", async () => {
      const { wrapper, state } = mountBoundCal({ start: "2026-10-08", end: undefined });
      await flushPromises();

      const cell = document.querySelector<HTMLElement>(
        `[data-reka-calendar-cell-trigger][data-value="2026-10-08"]:not([data-outside-view])`,
      )!;
      cell.focus();
      await flushPromises();
      pressKey(cell, "Enter", { code: "Enter" });
      await flushPromises();

      expect(state.value).toEqual({ start: "2026-10-08", end: "2026-10-08" });

      wrapper.unmount();
    });

    it("closes the anchor into a single-day range when it is clicked again", async () => {
      const { wrapper, state } = mountBoundCal({ start: "2026-10-08", end: undefined });
      await flushPromises();

      await clickDay("2026-10-08");

      expect(state.value).toEqual({ start: "2026-10-08", end: "2026-10-08" });

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

    // reka seeds its revert target at mount and refreshes it only for a range built inside the grid,
    // so after any commit from outside its "revert" aims at a snapshot that no longer exists. Every
    // case below arms reka's isEditing through that external sync, which is what makes Escape act.
    describe("a revert target reka never refreshed", () => {
      it("keeps a value that arrived from outside instead of wiping it", async () => {
        const { wrapper, state, emits } = mountBoundCal(undefined);
        await flushPromises();

        state.value = { start: "2026-10-08", end: undefined };
        await flushPromises();

        pressEscape(inViewCellElement("2026-10-08")!);
        // Two flushes: reka's restore settles in one, what it forwards in the next.
        await flushPromises();
        await flushPromises();

        expect(state.value).toEqual({ start: "2026-10-08", end: undefined });
        expect(emits).toEqual([]);

        wrapper.unmount();
      });

      it("keeps a complete range that was filled in one endpoint at a time", async () => {
        const { wrapper, state, emits } = mountBoundCal(undefined);
        await flushPromises();

        state.value = { start: "2026-10-08", end: undefined };
        await flushPromises();
        state.value = { start: "2026-10-08", end: "2026-10-14" };
        await flushPromises();

        pressEscape(inViewCellElement("2026-10-08")!);
        // Two flushes: reka's restore settles in one, what it forwards in the next.
        await flushPromises();
        await flushPromises();

        expect(state.value).toEqual({ start: "2026-10-08", end: "2026-10-14" });
        expect(emits).toEqual([]);

        wrapper.unmount();
      });

      it("does not resurrect a range that was cleared from outside", async () => {
        const { wrapper, state, emits } = mountBoundCal({ start: "2026-10-08", end: "2026-10-14" });
        await flushPromises();

        state.value = undefined;
        await flushPromises();

        pressEscape(inViewCellElement(todayDate().toString())!);
        // Two flushes: reka's restore settles in one, the resurrection it used to emit in the next.
        await flushPromises();
        await flushPromises();

        expect(state.value).toBeUndefined();
        expect(emits).toEqual([]);

        wrapper.unmount();
      });

      // reka rewrites its own revert target while performing the revert we refused. Adopting that as
      // committed would tell the NEXT Escape the same stale revert is safe.
      it("stays stale on a repeated Escape instead of adopting the refused range", async () => {
        const { wrapper, state } = mountBoundCal({ start: "2026-10-08", end: "2026-10-14" });
        await flushPromises();

        state.value = undefined;
        await flushPromises();

        // Twice: the first Escape is the one whose refusal reka answers by rewriting its target.
        for (let attempt = 0; attempt < 2; attempt++) {
          pressEscape(inViewCellElement(todayDate().toString())!);
          await flushPromises();
          await flushPromises();
        }

        expect(state.value).toBeUndefined();

        wrapper.unmount();
      });

      // reka drags its placeholder to the revert target's start; nothing re-drives it for a kept model
      // that has no start of its own, so the grid would sit on the month we refused.
      it("keeps the view on the kept model, not on the refused range's month", async () => {
        // Today-relative on purpose: with a fixed October fixture the assertion would stop
        // discriminating for the whole of that month, when the refused month IS today's month.
        const refusedStart = todayDate().add({ months: 2 });
        const { wrapper, state } = mountBoundCal({
          start: refusedStart.toString(),
          end: refusedStart.add({ days: 6 }).toString(),
        });
        await flushPromises();

        const heading = () => wrapper.find(".vc-range-calendar__heading").text();
        state.value = undefined;
        await flushPromises();
        const headingBeforeEscape = heading();

        pressEscape(inViewCellElement(todayDate().toString())!);
        await flushPromises();
        await flushPromises();

        expect(heading()).toBe(headingBeforeEscape);

        wrapper.unmount();
      });

      // The footer Clear is a commit WE emit, so the props watch skips it as our own echo — nothing
      // else can tell Escape the range is gone. The `show-footer` the orders filter now passes is what
      // puts this button in front of a user.
      it("does not bring the range back after the footer cleared it", async () => {
        const { wrapper, state, emits } = mountBoundCal(
          { start: "2026-10-08", end: "2026-10-14" },
          { showFooter: true },
        );
        await flushPromises();

        await wrapper.find(".vc-range-calendar__footer-btn").trigger("click");
        await flushPromises();
        expect(state.value).toBeUndefined();
        const emitCountAfterClear = emits.length;

        pressEscape(inViewCellElement(todayDate().toString())!);
        await flushPromises();
        await flushPromises();

        expect(state.value).toBeUndefined();
        expect(emits.slice(emitCountAfterClear)).toEqual([]);

        wrapper.unmount();
      });

      // reka cannot hold an end-only range: it rewrites it as a start anchor. On the Escape route that
      // rewrite used to be forwarded, turning "up to the 14th" into "from the 14th".
      it("keeps an end-only range end-only across an Escape", async () => {
        const { wrapper, state } = mountBoundCal({ start: undefined, end: "2026-10-14" });
        await flushPromises();

        state.value = { start: "2026-10-08", end: "2026-10-14" };
        await flushPromises();
        state.value = { start: undefined, end: "2026-10-14" };
        await flushPromises();

        pressEscape(inViewCellElement("2026-10-14")!);
        await flushPromises();
        await flushPromises();

        expect(state.value).toEqual({ start: undefined, end: "2026-10-14" });

        wrapper.unmount();
      });

      // The swallowed revert leaves reka's own start/end on the reverted dates; the grid has to be
      // pulled back to the model, or the selection it paints outlives the value. The range is filled
      // one endpoint at a time on purpose — a complete range in one step never arms reka's revert.
      it("repaints the grid from the model after swallowing the revert", async () => {
        const { wrapper, state } = mountBoundCal(undefined);
        await flushPromises();

        state.value = { start: "2026-10-08", end: undefined };
        await flushPromises();
        state.value = { start: "2026-10-08", end: "2026-10-14" };
        await flushPromises();

        pressEscape(inViewCellElement("2026-10-08")!);
        // Two flushes: reka's restore settles in one, what it forwards in the next.
        await flushPromises();
        await flushPromises();

        expect(inViewCellElement("2026-10-08")?.dataset.selectionStart).toBeDefined();
        expect(inViewCellElement("2026-10-14")?.dataset.selectionEnd).toBeDefined();

        wrapper.unmount();
      });
    });

    // The guard is armed on every Escape, but reka only answers while it is editing — after a complete
    // commit from outside it does not, so the guard is left armed AND stale (its revert target is still
    // the mount value). The next keyboard pick then lands in the stale branch and is swallowed: the
    // grid repaints to the committed range and the keystroke disappears with no feedback. Pointer picks
    // are safe on their own (@pointerdown disarms), but reka's cell trigger stops arrows/Enter/Space
    // from bubbling, so only a capture-phase handler can disarm for the keyboard.
    it("does not swallow a keyboard pick after an unanswered stale Escape", async () => {
      const { wrapper, state } = mountBoundCal({ start: "2026-10-08", end: "2026-10-14" });
      await flushPromises();

      // A complete range: reka's own watcher early-returns, so it never refreshes its revert target.
      state.value = { start: "2026-11-05", end: "2026-11-12" };
      await flushPromises();

      pressEscape(inViewCellElement("2026-11-05")!);
      await flushPromises();
      await flushPromises();

      const cell = inViewCellElement("2026-11-20")!;
      cell.focus();
      await flushPromises();
      pressKey(cell, "Enter", { code: "Enter" });
      await flushPromises();

      expect(state.value).toEqual({ start: "2026-11-20", end: undefined });

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

  // reka exposes today as a data attribute only; the ARIA state is ours to add.
  it("marks today with aria-current", () => {
    const wrapper = mountCal({ modelValue: undefined });
    const today = todayDate().toString();
    const cell = wrapper.find(`[data-reka-calendar-cell-trigger][data-value="${today}"]:not([data-outside-view])`);

    expect(cell.attributes("aria-current")).toBe("date");
    expect(cell.attributes("data-today")).toBeDefined();
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
