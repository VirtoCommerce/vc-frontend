import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import SalesRepRuleChips from "./sales-rep-rule-chips.vue";
import type { SalesRepRuleType } from "../types";

const PERIOD_RULES: SalesRepRuleType[] = [
  { name: "month", label: "This month" },
  { name: "year", label: "This year" },
];

const createWrapper = createWrapperFactory(mount, SalesRepRuleChips, {
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcIcon: true,
      // Rendered, not stubbed away: the tracked-metric hint lives in its trigger slot.
      VcTooltip: { template: '<span><slot name="trigger" /></span>' },
    },
  },
});

const labels = (wrapper: ReturnType<typeof createWrapper>) =>
  wrapper.findAll(".sales-rep-rule-chips__label").map((label) => label.text());

const activeLabel = (wrapper: ReturnType<typeof createWrapper>) =>
  wrapper.find(".sales-rep-rule-chips__tab--active .sales-rep-rule-chips__label").text();

describe("SalesRepRuleChips", () => {
  // A set of alternatives reads with the widest option first — "All, Orders, Customers…".
  it("puts the baseline tab first by default", () => {
    const wrapper = createWrapper({ props: { rules: PERIOD_RULES, allLabel: "All time" } });

    expect(labels(wrapper)).toEqual(["All time", "This month", "This year"]);
  });

  // A vocabulary that reads as a progression widens left to right, so the baseline belongs at the end.
  it("puts the baseline tab last when asked", () => {
    const wrapper = createWrapper({ props: { rules: PERIOD_RULES, allLabel: "All time", allLast: true } });

    expect(labels(wrapper)).toEqual(["This month", "This year", "All time"]);
  });

  it("marks the baseline active while no rule is selected, wherever it sits", () => {
    const wrapper = createWrapper({ props: { rules: PERIOD_RULES, allLabel: "All time", allLast: true } });

    expect(activeLabel(wrapper)).toBe("All time");
  });

  it("selects a rule, and clears it back to the baseline", async () => {
    const wrapper = createWrapper({
      props: { rules: PERIOD_RULES, allLabel: "All time", allLast: true, modelValue: undefined },
    });
    const tabs = wrapper.findAll(".sales-rep-rule-chips__tab");

    await tabs[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["month"]);

    // The baseline is the last tab here, and clearing is what clicking it means.
    await tabs[2].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([undefined]);
  });

  // Adornments are the caller's to decide: the component hands each tab's name to the slot and knows
  // nothing about what the name means. The baseline has no name.
  it("renders the suffix slot for every tab, naming each one", () => {
    const wrapper = createWrapper({
      props: { rules: PERIOD_RULES, allLabel: "All time" },
      slots: {
        suffix: (params: { tab: { name?: string } }) => h("i", { class: "mark" }, params.tab.name ?? "baseline"),
      },
    });

    expect(wrapper.findAll(".mark").map((mark) => mark.text())).toEqual(["baseline", "month", "year"]);
  });
});
