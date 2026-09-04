import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { todayDate } from "./use-calendar-base";
import VcCalendar from "./vc-calendar.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
}));

function mountCal(props = {}, options: { attachTo?: Element } = {}) {
  return mount(VcCalendar, {
    props: { modelValue: undefined, ...props },
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

function inViewCell(wrapper: ReturnType<typeof mountCal>, iso: string) {
  return wrapper.find(`[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`);
}

// The calendar the app actually renders, so its own wiring to the shared base needs holding down.
describe("VcCalendar — keyboard navigation and focus entry", () => {
  it("moves focus by week/month/year and leaves unrelated keys alone", async () => {
    const wrapper = mountCal({ modelValue: "2026-10-08", firstDayOfWeek: 1 }, { attachTo: document.body });
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

    pressKey(root, "PageUp", { shiftKey: true });
    await flushPromises();
    expect(activeCellIso()).toBe("2025-11-11");

    const unrelatedEvent = pressKey(root, "a");
    await flushPromises();
    expect(unrelatedEvent.defaultPrevented).toBe(false);
    expect(activeCellIso()).toBe("2025-11-11");

    wrapper.unmount();
  });

  it("opens with focus on the selected date, not on today", async () => {
    const wrapper = mountCal({ modelValue: "2026-10-08" }, { attachTo: document.body });
    await flushPromises();

    wrapper.vm.focusActiveCell();
    expect(activeCellIso()).toBe("2026-10-08");

    wrapper.unmount();
  });
});

describe("VcCalendar — re-picking the selected date", () => {
  it("keeps the date instead of clearing it", async () => {
    const wrapper = mountCal({ modelValue: "2020-06-10", max: "2020-06-15" });
    await inViewCell(wrapper, "2020-06-10").trigger("click");
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["2020-06-10"]);
  });

  // An optional field with no clear button and no footer needs the re-click as its only pointer route.
  it("clears the date when preventDeselect is off", async () => {
    const wrapper = mountCal({ modelValue: "2020-06-10", max: "2020-06-15", preventDeselect: false });
    await inViewCell(wrapper, "2020-06-10").trigger("click");
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined]);
  });
});

describe("VcCalendar — footer Clear", () => {
  // The twins have to agree, and an already-empty field emits no model change — so `clear` is all a
  // shell can react to.
  it("emits clear alongside the model change", async () => {
    const wrapper = mountCal({ modelValue: "2020-06-10", max: "2020-06-15", showFooter: true });
    await wrapper.find(".vc-calendar__footer-btn--ghost").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined]);
    expect(wrapper.emitted("clear")).toHaveLength(1);
  });

  it("emits clear even when the date is already empty", async () => {
    const wrapper = mountCal({ modelValue: undefined, showFooter: true });
    await wrapper.find(".vc-calendar__footer-btn--ghost").trigger("click");
    expect(wrapper.emitted("clear")).toHaveLength(1);
  });
});

describe("VcCalendar — placeholder clamping to [min, max]", () => {
  it("opens on the max month instead of today's fully-disabled month when max is in the past", () => {
    const wrapper = mountCal({ max: "2020-06-15" });
    const maxCell = inViewCell(wrapper, "2020-06-15");
    expect(maxCell.exists()).toBe(true);
    expect(maxCell.attributes("data-disabled")).toBeUndefined();
  });

  it("keeps the view in bounds when a clear re-seeds the placeholder to today", async () => {
    const wrapper = mountCal({ modelValue: "2020-06-01", max: "2020-06-15" });
    await wrapper.setProps({ modelValue: undefined });
    await flushPromises();
    expect(inViewCell(wrapper, "2020-06-15").exists()).toBe(true);
  });

  it("opens on the min month when min is in the future", () => {
    const wrapper = mountCal({ min: "2030-03-10" });
    const minCell = inViewCell(wrapper, "2030-03-10");
    expect(minCell.exists()).toBe(true);
    expect(minCell.attributes("data-disabled")).toBeUndefined();
  });

  // A consumer can move min/max reactively, so a hard bound can land on an already-open calendar.
  describe("a bound that arrives after mount", () => {
    it("re-clamps the view when max moves into the past", async () => {
      const wrapper = mountCal();
      await wrapper.setProps({ max: "2020-06-15" });
      await flushPromises();
      expect(inViewCell(wrapper, "2020-06-15").exists()).toBe(true);
    });

    it("re-clamps the view when min moves into the future", async () => {
      const wrapper = mountCal();
      await wrapper.setProps({ min: "2030-03-10" });
      await flushPromises();
      expect(inViewCell(wrapper, "2030-03-10").exists()).toBe(true);
    });

    it("leaves month navigation open so the user is not trapped on the clamped month", async () => {
      const wrapper = mountCal();
      await wrapper.setProps({ max: "2020-06-15" });
      await flushPromises();

      const prev = wrapper.find(".vc-calendar__nav--month-prev");
      expect(prev.attributes("data-disabled")).toBeUndefined();

      await prev.trigger("click");
      expect(inViewCell(wrapper, "2020-05-15").exists()).toBe(true);
    });

    it("leaves a view already inside the bounds where the user navigated it", async () => {
      const wrapper = mountCal({ modelValue: "2020-06-01" });
      await wrapper.find(".vc-calendar__nav--month-prev").trigger("click");
      expect(inViewCell(wrapper, "2020-05-01").exists()).toBe(true);

      await wrapper.setProps({ min: "2020-01-01" });
      await flushPromises();
      expect(inViewCell(wrapper, "2020-05-01").exists()).toBe(true);
    });
  });
});

// Advisory bounds point at the opposite endpoint without trapping the user: marked days stay selectable.
describe("VcCalendar — advisory bounds (softMin/softMax)", () => {
  const OCTOBER = { modelValue: "2026-10-08" };

  it("marks the days outside them and leaves the rest alone", () => {
    const wrapper = mountCal({ ...OCTOBER, softMin: "2026-10-05", softMax: "2026-10-14" });

    expect(inViewCell(wrapper, "2026-10-04").attributes("data-soft-out-of-bounds")).toBe("true");
    expect(inViewCell(wrapper, "2026-10-20").attributes("data-soft-out-of-bounds")).toBe("true");
    expect(inViewCell(wrapper, "2026-10-05").attributes("data-soft-out-of-bounds")).toBeUndefined();
    expect(inViewCell(wrapper, "2026-10-14").attributes("data-soft-out-of-bounds")).toBeUndefined();
  });

  it("keeps a marked day enabled, selectable and titled", async () => {
    const wrapper = mountCal({ ...OCTOBER, softMax: "2026-10-14" });
    const marked = inViewCell(wrapper, "2026-10-20");

    expect(marked.attributes("data-disabled")).toBeUndefined();
    expect(marked.attributes("aria-disabled")).toBeUndefined();
    expect(marked.attributes("title")).toBe("ui_kit.calendar.outside_suggested_range");

    await marked.trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["2026-10-20"]);
  });

  // reka owns the cell's aria-label, so the reason can only be a description; `title` is hover-only.
  it("describes a marked day through aria-describedby, not the title alone", () => {
    const wrapper = mountCal({ ...OCTOBER, softMax: "2026-10-14" });
    const marked = inViewCell(wrapper, "2026-10-20");

    const hintId = marked.attributes("aria-describedby");
    expect(hintId).toBeTruthy();
    const hint = wrapper.find(`#${hintId}`);
    expect(hint.exists()).toBe(true);
    expect(hint.classes()).toContain("sr-only");
    expect(hint.text()).toBe("ui_kit.calendar.outside_suggested_range");

    expect(inViewCell(wrapper, "2026-10-05").attributes("aria-describedby")).toBeUndefined();
  });

  it("renders no hint node when no advisory bound is set", () => {
    const wrapper = mountCal(OCTOBER);

    expect(wrapper.find(".sr-only").exists()).toBe(false);
    expect(inViewCell(wrapper, "2026-10-20").attributes("aria-describedby")).toBeUndefined();
  });

  // reka leaves a disabled day without tabindex, so the entry fallback has to skip it.
  it("focuses the first ENABLED day when min starts mid-month", async () => {
    const min = todayDate().add({ years: 4 }).set({ day: 10 });
    const wrapper = mountCal({ modelValue: undefined, min: min.toString() }, { attachTo: document.body });
    await flushPromises();

    wrapper.vm.focusActiveCell();
    await flushPromises();

    const active = document.activeElement as HTMLElement | null;
    expect(active?.dataset.value).toBe(min.toString());
    expect(active?.dataset.disabled).toBeUndefined();

    wrapper.unmount();
  });

  it("marks today with aria-current", () => {
    const wrapper = mountCal({});
    const today = todayDate().toString();

    expect(inViewCell(wrapper, today).attributes("aria-current")).toBe("date");
    expect(inViewCell(wrapper, today).attributes("data-today")).toBeDefined();
  });

  it("gates neither month nor year navigation", async () => {
    const wrapper = mountCal({ ...OCTOBER, softMin: "2026-10-05", softMax: "2026-10-14" });

    expect(wrapper.find(".vc-calendar__nav--month-next").attributes("data-disabled")).toBeUndefined();
    expect(wrapper.find(".vc-calendar__nav--year-next").attributes("disabled")).toBeUndefined();
    expect(wrapper.find(".vc-calendar__nav--year-prev").attributes("disabled")).toBeUndefined();

    await wrapper.find(".vc-calendar__nav--month-next").trigger("click");
    expect(inViewCell(wrapper, "2026-11-20").exists()).toBe(true);
  });

  it("never moves the open month, unlike min/max", async () => {
    const wrapper = mountCal({ ...OCTOBER });
    await wrapper.setProps({ softMax: "2020-06-15" });
    await flushPromises();

    expect(inViewCell(wrapper, "2026-10-08").exists()).toBe(true);
  });

  it("lets a hard bound win where the two overlap", () => {
    const wrapper = mountCal({ ...OCTOBER, max: "2026-10-14", softMax: "2026-10-10" });
    const hard = inViewCell(wrapper, "2026-10-20");
    const soft = inViewCell(wrapper, "2026-10-12");

    expect(hard.attributes("data-disabled")).toBe("");
    expect(soft.attributes("data-disabled")).toBeUndefined();
    expect(soft.attributes("data-soft-out-of-bounds")).toBe("true");
  });

  it("marks nothing when no advisory bound is given", () => {
    const wrapper = mountCal(OCTOBER);
    expect(wrapper.findAll("[data-soft-out-of-bounds]")).toHaveLength(0);
  });
});
