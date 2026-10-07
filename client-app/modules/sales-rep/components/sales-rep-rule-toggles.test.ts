import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import SalesRepRuleToggles from "./sales-rep-rule-toggles.vue";
import VcCheckbox from "@/ui-kit/components/atoms/checkbox/vc-checkbox.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

// The checkbox is real — its prop and slot contract is exactly what the toggles lean on, and a stub would
// keep passing after it changed.
const global = {
  components: { VcCheckbox },
  stubs: {
    VcIcon: true,
    VcLabel: true,
    VcInputDetails: true,
    // A bare stub would swallow the checkbox label, which lives in its `trigger` slot.
    VcTooltip: { template: '<span><slot name="trigger" /></span>' },
  },
};

describe("SalesRepRuleToggles", () => {
  const rules = [
    { name: "New", label: "New" },
    { name: "Processing", label: "Processing" },
  ];

  function mountToggles(hidden: string[]) {
    return mount(SalesRepRuleToggles, { props: { rules, hidden }, global });
  }

  it("checks a rule that is not hidden, and labels it from the backend", () => {
    const boxes = mountToggles(["Processing"]).findAll("input[type=checkbox]");

    expect((boxes[0].element as HTMLInputElement).checked).toBe(true);
    expect((boxes[1].element as HTMLInputElement).checked).toBe(false);
  });

  it("reports a toggle by rule name", async () => {
    const wrapper = mountToggles([]);

    await wrapper.findAll("input[type=checkbox]")[1].setValue(false);

    expect(wrapper.emitted("toggle")).toEqual([["Processing"]]);
  });

  // The chips row always offers its "All" baseline, so no rule has to stay checked.
  it("leaves every box enabled, including the last checked one", () => {
    const boxes = mountToggles(["Processing"]).findAll("input[type=checkbox]");

    expect(boxes.every((box) => !(box.element as HTMLInputElement).disabled)).toBe(true);
  });

  it("reports a toggle for the last checked rule rather than refusing it", async () => {
    const wrapper = mountToggles(["Processing"]);

    await wrapper.findAll("input[type=checkbox]")[0].setValue(false);

    expect(wrapper.emitted("toggle")).toEqual([["New"]]);
  });
});
