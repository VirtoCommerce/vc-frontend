import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import VcCalendar from "./vc-calendar.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "en" } }),
}));

function mountCal(props = {}) {
  return mount(VcCalendar, {
    props: { modelValue: undefined, ...props },
    global: { stubs: { VcIcon: true } },
  });
}

function inViewCell(wrapper: ReturnType<typeof mountCal>, iso: string) {
  return wrapper.find(`[data-reka-calendar-cell-trigger][data-value="${iso}"]:not([data-outside-view])`);
}

describe("VcCalendar — re-picking the selected date", () => {
  it("keeps the date instead of clearing it", async () => {
    const wrapper = mountCal({ modelValue: "2020-06-10", max: "2020-06-15" });
    await inViewCell(wrapper, "2020-06-10").trigger("click");
    await flushPromises();
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["2020-06-10"]);
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

  // The range picker derives each calendar's bound from the opposite endpoint, so it lands after mount.
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
