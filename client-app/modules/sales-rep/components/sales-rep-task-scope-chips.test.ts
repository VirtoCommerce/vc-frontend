import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcTabSwitch } from "@/ui-kit/components/molecules";
import SalesRepTaskScopeChips from "./sales-rep-task-scope-chips.vue";
import type { SalesRepTaskScopeType } from "../types/tasks";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
  }),
}));

type PropsType = { view?: SalesRepTaskScopeType; showDay?: boolean };

const DAY = "Oct 20, 2026";
const TODAY = "sales_rep.tasks.today";
const ALL = "sales_rep.tasks.all";

// The real VcTabSwitch, not a stub: the pressed state and the focus handoff both depend on its own markup.
// VcIcon is resolved above the `v-if` that guards it, so it needs a stub even with no icon prop.
function createWrapper(options: PropsType = {}, attachTo?: HTMLElement) {
  return mount(SalesRepTaskScopeChips, {
    attachTo,
    props: {
      // `in`, not a default: an explicit undefined view (a status tab is on) must stay undefined.
      view: "view" in options ? options.view : "today",
      showDay: options.showDay ?? false,
      dayLabel: DAY,
      counts: { today: 3, all: 12 },
    },
    global: { components: { VcTabSwitch }, stubs: { VcIcon: true } },
  });
}

type WrapperType = ReturnType<typeof createWrapper>;

const chips = (wrapper: WrapperType) => wrapper.findAll(".sales-rep-rule-chip");
const labels = (wrapper: WrapperType) => chips(wrapper).map((chip) => chip.get(".sales-rep-rule-chip__label").text());
const pressed = (wrapper: WrapperType) => chips(wrapper).map((chip) => chip.get("button").attributes("aria-pressed"));
const chip = (wrapper: WrapperType, label: string) => chips(wrapper)[labels(wrapper).indexOf(label)];

describe("SalesRepTaskScopeChips", () => {
  it("offers Today and All with their badges, and no day chip while today is the picked day", () => {
    const wrapper = createWrapper();

    expect(labels(wrapper)).toEqual([TODAY, ALL]);
    expect(wrapper.findAll(".sales-rep-rule-chip__count").map((count) => count.text())).toEqual(["3", "12"]);
  });

  it("puts a picked day's chip, named by its date and with no badge, ahead of Today", () => {
    const wrapper = createWrapper({ view: "day", showDay: true });

    expect(labels(wrapper)).toEqual([DAY, TODAY, ALL]);
    expect(chip(wrapper, DAY).find(".sales-rep-rule-chip__count").exists()).toBe(false);
  });

  it.each(["day", "today", "all"] as const)("presses %s as the chip on screen", (view) => {
    const wrapper = createWrapper({ view, showDay: true });

    expect(pressed(wrapper)).toEqual(["day", "today", "all"].map((value) => String(value === view)));
  });

  // A status tab has taken over: none of these is on, but the picked day's chip stays to get back to it.
  it("presses none while a status tab is on", () => {
    const wrapper = createWrapper({ view: undefined, showDay: true });

    expect(pressed(wrapper)).toEqual(["false", "false", "false"]);
  });

  it.each([
    ["day", DAY],
    ["today", TODAY],
    ["all", ALL],
  ] as const)("emits %s from its chip", async (event, label) => {
    const wrapper = createWrapper({ showDay: true });

    await chip(wrapper, label).get("button").trigger("click");

    expect(wrapper.emitted(event)).toHaveLength(1);
  });

  // A sibling of the chip, not inside it: the chip's content is already a <button>.
  it("clears the picked day from its own button, named with the date", async () => {
    const wrapper = createWrapper({ view: "day", showDay: true });
    const clear = wrapper.get(".sales-rep-task-scope-chips__clear");

    expect(clear.element.closest(".sales-rep-rule-chip")).toBeNull();
    expect(clear.attributes("aria-label")).toBe(`sales_rep.tasks.clear_day_aria ${JSON.stringify({ date: DAY })}`);

    await clear.trigger("click");

    expect(wrapper.emitted("clearDay")).toHaveLength(1);
    expect(wrapper.emitted("day")).toBeUndefined();
  });

  // The × leaves with its chip; without a next stop, focus would drop to <body> and a keyboard user back to the top.
  it("hands focus to Today as the picked day's chip is cleared", async () => {
    const wrapper = createWrapper({ view: "day", showDay: true }, document.body);
    const clear = wrapper.get<HTMLButtonElement>(".sales-rep-task-scope-chips__clear");
    clear.element.focus();

    await clear.trigger("click");

    expect(document.activeElement).toBe(chip(wrapper, TODAY).get("button").element);
    wrapper.unmount();
  });
});
