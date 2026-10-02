import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { VcTabSwitch } from "@/ui-kit/components/molecules";
import SalesRepRuleChip from "./sales-rep-rule-chip.vue";

// formatStatCount formats in the store's culture.
vi.mock("@/core/globals", () => ({ globals: { cultureName: "en-US" } }));

// The real VcTabSwitch, not a stub: the selected state lives in its markup, so a stub cannot see it.
// VcIcon is resolved above the `v-if` that guards it, so it needs a stub even with no icon prop.
function mountChip(props: { modelValue?: string; count?: number } = {}) {
  return mount(SalesRepRuleChip, {
    props: { value: "overdue", modelValue: undefined, label: "Overdue", ...props },
    slots: { append: '<span class="append" />' },
    global: { components: { VcTabSwitch }, stubs: { VcIcon: true } },
  });
}

describe("SalesRepRuleChip", () => {
  it("renders its label, count and append slot inside the tab's button", () => {
    const wrapper = mountChip({ count: 1200 });
    const button = wrapper.get("button");

    expect(button.get(".sales-rep-rule-chip__label").text()).toBe("Overdue");
    expect(button.get(".sales-rep-rule-chip__count").text()).toBe("1,200");
    expect(button.find(".append").exists()).toBe(true);
  });

  it("renders no count without one", () => {
    expect(mountChip().find(".sales-rep-rule-chip__count").exists()).toBe(false);
  });

  // Only the selected chip's count is accented; on the rest it would leave nothing to tell the selected one apart.
  it("accents the count only while its chip is selected", () => {
    const count = (modelValue?: string) =>
      mountChip({ modelValue, count: 3 }).get(".sales-rep-rule-chip__count").classes();

    expect(count("overdue")).toContain("sales-rep-rule-chip__count--checked");
    expect(count("upcoming")).not.toContain("sales-rep-rule-chip__count--checked");
    expect(count()).not.toContain("sales-rep-rule-chip__count--checked");
  });

  it("presses its tab while selected", () => {
    expect(mountChip({ modelValue: "overdue" }).get("button").attributes("aria-pressed")).toBe("true");
    expect(mountChip({ modelValue: "upcoming" }).get("button").attributes("aria-pressed")).toBe("false");
  });

  it("reports its own value when clicked", async () => {
    const wrapper = mountChip();

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("change")).toEqual([["overdue"]]);
  });
});
