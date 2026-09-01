import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import { VcCalendar } from "@/ui-kit/components/molecules";
import uiKitMessages from "@/ui-kit/locales/en.json";
import salesRepMessages from "../locales/en.json";
import SalesRepTaskCalendar from "./sales-rep-task-calendar.vue";
import type { SalesRepTaskDayMarkersType } from "../types/tasks";
import type { VueWrapper } from "@vue/test-utils";

// Real VcCalendar, not a stub: the point of these tests is that the dots land in the right CELLS and that the
// accessible text reaches the cell's aria-describedby — both of which only exist once reka renders the grid.
const i18n = createI18n({
  locale: "en",
  legacy: false,
  messages: { en: { ...uiKitMessages, ...salesRepMessages } },
  missingWarn: false,
});

// Pinned month, so the grid holds a known set of days no matter when the suite runs. October 2026 starts on a
// Thursday, so Sep 30 is always a leading padding cell.
const MONTH = "2026-10-01";
const SELECTED = "2026-10-15";
const PADDING_DAY = "2026-09-30";

function createWrapper(dayMarkers: SalesRepTaskDayMarkersType = {}) {
  return mount(SalesRepTaskCalendar, {
    props: { modelValue: SELECTED, month: MONTH, dayMarkers },
    global: { plugins: [i18n], components: { VcCalendar }, stubs: { VcIcon: true } },
  });
}

function getDay(wrapper: VueWrapper, iso: string) {
  return wrapper.get(`[data-reka-calendar-cell-trigger][data-value="${iso}"]`);
}

function dotsOn(wrapper: VueWrapper, iso: string): string[] {
  return getDay(wrapper, iso)
    .findAll(".sales-rep-task-calendar__dot")
    .map((dot) => dot.classes().find((name) => name.startsWith("sales-rep-task-calendar__dot--")) ?? "")
    .map((name) => name.replace("sales-rep-task-calendar__dot--", ""));
}

describe("SalesRepTaskCalendar dots", () => {
  // The rule the team set for this widget: a dot means "there is at least one of these here", never one dot
  // per task. Ten overdue tasks on a day are still one red dot.
  it("draws one dot per condition present, not one per task", () => {
    const wrapper = createWrapper({ [SELECTED]: ["overdue", "overdue", "overdue"] });

    expect(dotsOn(wrapper, SELECTED)).toEqual(["overdue"]);
  });

  it("keeps a fixed dot order however the day's conditions arrive", () => {
    const wrapper = createWrapper({ [SELECTED]: ["completed", "overdue", "upcoming"] });

    expect(dotsOn(wrapper, SELECTED)).toEqual(["upcoming", "overdue", "completed"]);
  });

  it("leaves an unmarked day bare", () => {
    const wrapper = createWrapper({ [SELECTED]: ["upcoming"] });

    expect(dotsOn(wrapper, "2026-10-16")).toEqual([]);
    expect(getDay(wrapper, "2026-10-16").find(".sales-rep-task-calendar__dots").exists()).toBe(false);
  });

  // Canceled is a real task state but not one of the three tabs, and the legend explains only three colours.
  it("gives a canceled task no dot at all", () => {
    const wrapper = createWrapper({ [SELECTED]: ["canceled"] });

    expect(dotsOn(wrapper, SELECTED)).toEqual([]);
  });

  // The grid is fixed-weeks, so it always shows some adjacent-month days. They carry tasks like any other day,
  // which is why the month query is padded a week either side.
  it("marks adjacent-month padding cells too", () => {
    const wrapper = createWrapper({ [PADDING_DAY]: ["overdue"] });

    expect(dotsOn(wrapper, PADDING_DAY)).toEqual(["overdue"]);
  });
});

describe("SalesRepTaskCalendar accessibility", () => {
  // The dots are decoration; the announcement rides on dayDescriptions because reka puts an explicit
  // aria-label (the full date) on the cell trigger, which excludes any slot content from the accessible name.
  it("hides the dots from assistive tech and describes the day in words instead", () => {
    const wrapper = createWrapper({ [SELECTED]: ["upcoming", "overdue"] });

    const day = getDay(wrapper, SELECTED);
    expect(day.get(".sales-rep-task-calendar__dots").attributes("aria-hidden")).toBe("true");

    const describedBy = day.attributes("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(wrapper.get(`[id="${describedBy}"]`).text()).toBe("Marked: Upcoming, Overdue");
    // The date label itself stays a date — the marker text is additional, not folded into the name.
    expect(day.attributes("aria-label")).not.toContain("Marked");
  });

  it("describes only the days that carry a dot", () => {
    const wrapper = createWrapper({ [SELECTED]: ["completed"], "2026-10-20": ["canceled"] });

    expect(getDay(wrapper, SELECTED).attributes("aria-describedby")).toBeTruthy();
    // Canceled draws nothing, so there is nothing to announce either.
    expect(getDay(wrapper, "2026-10-20").attributes("aria-describedby")).toBeUndefined();
  });
});

describe("SalesRepTaskCalendar selection", () => {
  it("reports the day the rep picked", async () => {
    const wrapper = createWrapper();

    await getDay(wrapper, "2026-10-20").trigger("click");

    expect(wrapper.emitted("update:modelValue")).toEqual([["2026-10-20"]]);
  });

  // These surfaces always scope a list to some day, so a cleared selection is ignored rather than leaving the
  // list with nothing to show.
  it("ignores a cleared selection", () => {
    const wrapper = createWrapper();

    wrapper.getComponent(VcCalendar).vm.$emit("update:modelValue", undefined);

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  // The month is controlled by the caller so the dots query and the grid cannot drift apart.
  it("forwards a month change from the grid's own arrows", async () => {
    const wrapper = createWrapper();

    await wrapper.get(".vc-calendar__nav--month-next").trigger("click");

    // VcCalendar also echoes the month it resolved on mount. Harmless: the anchor normalises to the same key,
    // so the echo is a no-op write and fires no second query.
    expect(wrapper.emitted("update:month")?.at(0)).toEqual([MONTH]);
    expect(wrapper.emitted("update:month")?.at(-1)).toEqual(["2026-11-01"]);
  });
});
