import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import { VcCalendar } from "@/ui-kit/components/molecules";
import enMessages from "@/ui-kit/locales/en.json";
import type { VueWrapper } from "@vue/test-utils";

const i18n = createI18n({ locale: "en", legacy: false, messages: { en: enMessages }, missingWarn: false });

// Pinned month, so the grid holds a known set of days no matter when the suite runs.
const MONTH_DAY = "2026-10-15";

// Stands in for a consumer's decoration: a dot carrying the ISO date it was handed.
const DAY_SLOT = '<span class="day-dot" :data-date="date" :data-outside="outsideView">{{ dayValue }}</span>';

type MountOptionsType = Parameters<typeof mount<typeof VcCalendar>>[1];

function createWrapper(props: InstanceType<typeof VcCalendar>["$props"] = {}, slots: MountOptionsType = {}) {
  return mount(VcCalendar, {
    props,
    ...slots,
    global: { plugins: [i18n], stubs: { VcIcon: true } },
  });
}

function getDay(wrapper: VueWrapper, iso: string) {
  return wrapper.get(`[data-reka-calendar-cell-trigger][data-value="${iso}"]`);
}

function getDescription(wrapper: VueWrapper, iso: string) {
  const day = getDay(wrapper, iso);
  return day.get(`[id="${day.attributes("aria-describedby")}"]`);
}

describe("VcCalendar", () => {
  describe("day slot", () => {
    it("renders the consumer's content in every day cell, alongside the day number", () => {
      const wrapper = createWrapper({ modelValue: MONTH_DAY }, { slots: { day: DAY_SLOT } });

      const day = getDay(wrapper, MONTH_DAY);
      expect(day.find(".day-dot").exists()).toBe(true);
      // The calendar's own text in the cell is still just the day number; the slot adds to it.
      const ownText = [...day.element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim())
        .join("");
      expect(ownText).toBe("15");
      expect(wrapper.findAll(".day-dot")).toHaveLength(wrapper.findAll("[data-reka-calendar-cell-trigger]").length);
    });

    it("hands the slot the ISO date, the day value and the outside-view flag", () => {
      const wrapper = createWrapper({ modelValue: MONTH_DAY, firstDayOfWeek: 1 }, { slots: { day: DAY_SLOT } });

      const inMonth = getDay(wrapper, MONTH_DAY).get(".day-dot");
      expect(inMonth.attributes("data-date")).toBe(MONTH_DAY);
      expect(inMonth.text()).toBe("15");
      expect(inMonth.attributes("data-outside")).toBe("false");

      // Sep 30 is padding from the previous month in this grid.
      const padding = getDay(wrapper, "2026-09-30").get(".day-dot");
      expect(padding.attributes("data-date")).toBe("2026-09-30");
      expect(padding.attributes("data-outside")).toBe("true");
    });

    it("does not describe anything on its own", () => {
      const wrapper = createWrapper({ modelValue: MONTH_DAY }, { slots: { day: DAY_SLOT } });

      expect(wrapper.find("[aria-describedby]").exists()).toBe(false);
    });
  });

  describe("day descriptions", () => {
    it("renders a visually hidden description and points the day at it", () => {
      const wrapper = createWrapper({
        modelValue: MONTH_DAY,
        dayDescriptions: { "2026-10-06": "2 overdue tasks" },
      });

      const day = getDay(wrapper, "2026-10-06");

      // reka's date label is the accessible name; the description must not be folded into it.
      expect(day.attributes("aria-label")).toContain("October");
      expect(day.attributes("aria-label")).not.toContain("overdue");

      const description = getDescription(wrapper, "2026-10-06");
      expect(description.classes()).toContain("sr-only");
      expect(description.text()).toBe("2 overdue tasks");
    });

    it("describes only the days it has text for", () => {
      const wrapper = createWrapper({
        modelValue: MONTH_DAY,
        dayDescriptions: { "2026-10-06": "2 overdue tasks", "2026-10-07": "" },
      });

      expect(getDay(wrapper, "2026-10-06").attributes("aria-describedby")).toBeDefined();
      // Empty text is nothing to announce.
      expect(getDay(wrapper, "2026-10-07").attributes("aria-describedby")).toBeUndefined();
      expect(getDay(wrapper, "2026-10-08").attributes("aria-describedby")).toBeUndefined();
      expect(wrapper.findAll(".sr-only")).toHaveLength(1);
    });

    it("describes the adjacent-month days the fixed-weeks grid pads with", () => {
      const wrapper = createWrapper({
        modelValue: MONTH_DAY,
        firstDayOfWeek: 1,
        dayDescriptions: { "2026-09-30": "1 overdue task" },
      });

      expect(getDay(wrapper, "2026-09-30").attributes("data-outside-view")).toBeDefined();
      expect(getDescription(wrapper, "2026-09-30").text()).toBe("1 overdue task");
    });

    it("works without the slot, and composes with it", () => {
      const wrapper = createWrapper(
        { modelValue: MONTH_DAY, dayDescriptions: { "2026-10-06": "2 overdue tasks" } },
        { slots: { day: DAY_SLOT } },
      );

      expect(getDay(wrapper, "2026-10-06").find(".day-dot").exists()).toBe(true);
      expect(getDescription(wrapper, "2026-10-06").text()).toBe("2 overdue tasks");
    });
  });

  describe("with neither the slot nor descriptions", () => {
    it("leaves the day cells exactly as they were", () => {
      const wrapper = createWrapper({ modelValue: MONTH_DAY });

      expect(wrapper.find("[aria-describedby]").exists()).toBe(false);
      expect(wrapper.find(".sr-only").exists()).toBe(false);
      // The cell slot is never passed, so reka renders the cell — no leftover v-if anchors.
      expect(getDay(wrapper, MONTH_DAY).html()).not.toContain("<!--");
      expect(getDay(wrapper, MONTH_DAY).text()).toBe("15");
    });

    it("leaves the day cells alone for an empty descriptions map", () => {
      const wrapper = createWrapper({ modelValue: MONTH_DAY, dayDescriptions: {} });

      expect(getDay(wrapper, MONTH_DAY).html()).not.toContain("<!--");
      expect(getDay(wrapper, MONTH_DAY).text()).toBe("15");
    });
  });

  describe("displayed month", () => {
    function emittedMonths(wrapper: VueWrapper) {
      return (wrapper.emitted("update:month") ?? []).map(([month]) => month);
    }

    it("reports the starting month on mount", () => {
      expect(emittedMonths(createWrapper({ modelValue: MONTH_DAY }))).toEqual(["2026-10-01"]);
    });

    it("reports the month the header arrows move to", async () => {
      const wrapper = createWrapper({ modelValue: MONTH_DAY });

      await wrapper.get(".vc-calendar__nav--month-next").trigger("click");
      await wrapper.get(".vc-calendar__nav--month-prev").trigger("click");
      await wrapper.get(".vc-calendar__nav--year-next").trigger("click");
      await wrapper.get(".vc-calendar__nav--year-prev").trigger("click");

      expect(emittedMonths(wrapper)).toEqual(["2026-10-01", "2026-11-01", "2026-10-01", "2027-10-01", "2026-10-01"]);
    });

    it("follows the model value into another month, and stays quiet within one", async () => {
      const wrapper = createWrapper({ modelValue: MONTH_DAY });

      await wrapper.setProps({ modelValue: "2026-10-02" });
      expect(emittedMonths(wrapper)).toEqual(["2026-10-01"]);

      await wrapper.setProps({ modelValue: "2026-06-02" });
      expect(emittedMonths(wrapper)).toEqual(["2026-10-01", "2026-06-01"]);
    });

    it("displays the month prop when the consumer drives it", async () => {
      const wrapper = createWrapper({ month: "2026-06-15" });

      expect(getDay(wrapper, "2026-06-15").attributes("data-outside-view")).toBeUndefined();
      expect(emittedMonths(wrapper)).toEqual(["2026-06-01"]);

      await wrapper.setProps({ month: "2026-07-20" });

      expect(getDay(wrapper, "2026-07-20").attributes("data-outside-view")).toBeUndefined();
      expect(emittedMonths(wrapper)).toEqual(["2026-06-01", "2026-07-01"]);
    });

    it("ignores an unparseable month rather than resetting the view", async () => {
      const wrapper = createWrapper({ month: "2026-06-15" });

      await wrapper.setProps({ month: "not-a-date" });

      expect(getDay(wrapper, "2026-06-15").attributes("data-outside-view")).toBeUndefined();
      expect(emittedMonths(wrapper)).toEqual(["2026-06-01"]);
    });
  });
});
