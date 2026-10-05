import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcTabSwitch } from "@/ui-kit/components/molecules";
import SalesRepRuleChips from "./sales-rep-rule-chips.vue";
import type { SalesRepRuleType } from "../types";

// formatStatCount formats in the store's culture.
vi.mock("@/core/globals", () => ({ globals: { cultureName: "en-US" } }));

const RULES: SalesRepRuleType[] = [
  { name: "New", label: "New" },
  { name: "Processing", label: "Processing" },
];

// The real VcTabSwitch, not a stub: the selected state lives in its markup, so a stub cannot see it.
// VcIcon is resolved above the `v-if` that guards it, so it needs a stub even with no icon prop.
function mountChips(props: Partial<InstanceType<typeof SalesRepRuleChips>["$props"]> = {}) {
  return mount(SalesRepRuleChips, {
    props: { rules: RULES, allLabel: "All", ...props },
    global: { components: { VcTabSwitch }, stubs: { VcIcon: true } },
  });
}

const pressed = (wrapper: ReturnType<typeof mountChips>) =>
  wrapper.findAll(".sales-rep-rule-chips__tab button").map((tab) => tab.attributes("aria-pressed"));

describe("SalesRepRuleChips", () => {
  it("presses the baseline tab while no rule is chosen", () => {
    expect(pressed(mountChips())).toEqual(["true", "false", "false"]);
  });

  it("presses only the chosen rule's tab", () => {
    expect(pressed(mountChips({ modelValue: "Processing" }))).toEqual(["false", "false", "true"]);
  });

  it("clears the filter when the baseline tab is clicked back", async () => {
    const wrapper = mountChips({ modelValue: "Processing" });

    await wrapper.findAll(".sales-rep-rule-chips__tab button")[0].trigger("click");

    expect(wrapper.emitted("update:modelValue")).toEqual([[undefined]]);
  });

  it("reports the rule name when a rule tab is clicked", async () => {
    const wrapper = mountChips();

    await wrapper.findAll(".sales-rep-rule-chips__tab button")[2].trigger("click");

    expect(wrapper.emitted("update:modelValue")).toEqual([["Processing"]]);
  });

  // The baseline's value is a boolean, so no non-empty rule name can equal it — a string sentinel
  // made a rule of that name permanently unselectable and left two tabs pressed at once.
  it("keeps a rule selectable whatever non-empty name it has", async () => {
    const wrapper = mountChips({ rules: [{ name: "__all__", label: "Archive" }] });

    expect(pressed(wrapper)).toEqual(["true", "false"]);

    await wrapper.findAll(".sales-rep-rule-chips__tab button")[1].trigger("click");

    expect(wrapper.emitted("update:modelValue")).toEqual([["__all__"]]);
  });

  // The backend "all" passthrough would duplicate the baseline tab.
  it("drops a backend all-rule instead of rendering a second baseline", () => {
    const wrapper = mountChips({ rules: [{ name: "All", label: "All" }, ...RULES] });

    expect(wrapper.findAll(".sales-rep-rule-chips__tab")).toHaveLength(3);
  });

  it("falls back to the baseline when the chosen rule leaves the vocabulary", async () => {
    const wrapper = mountChips({ modelValue: "Processing" });

    await wrapper.setProps({ rules: [{ name: "New", label: "New" }] });

    expect(wrapper.emitted("update:modelValue")).toEqual([[undefined]]);
  });

  // An in-flight refetch empties the list transiently; that must not read as "the rule is gone".
  it("keeps the selection while the vocabulary is still loading", async () => {
    const wrapper = mountChips({ modelValue: "Processing", loading: true });

    await wrapper.setProps({ rules: [] });

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });

  it("renders a count only for the rules that carry one", () => {
    const wrapper = mountChips({
      rules: [
        { name: "New", label: "New", count: 4 },
        { name: "Processing", label: "Processing" },
      ],
      allCount: 9,
    });

    expect(wrapper.findAll(".sales-rep-rule-chips__count").map((count) => count.text())).toEqual(["9", "4"]);
  });

  // A zero count is on the documents page's first-paint path: allCount starts at 0 and the category
  // query resolves before the documents one, so a truthiness guard would hide a real number.
  it("renders a zero count rather than dropping it", () => {
    const wrapper = mountChips({ rules: [{ name: "New", label: "New", count: 0 }], allCount: 0 });

    expect(wrapper.findAll(".sales-rep-rule-chips__count").map((count) => count.text())).toEqual(["0", "0"]);
  });
});
