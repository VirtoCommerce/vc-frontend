import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { VcTabSwitch, VcTabSwitchGroup } from "@/ui-kit/components/molecules";
import CategorySort from "./category-sort.vue";
import type { IProductSortingOption } from "@/shared/catalog/composables/useProductSortings";

const CHECKED = "vc-tab-switch--checked";

const OPTIONS: IProductSortingOption[] = [
  { id: "", name: "Featured", shortName: "Featured" },
  { id: "price-ascending", name: "Price, low to high", shortName: "Price ↑" },
  { id: "createddate-descending", name: "Date, new to old", shortName: "Newest" },
];

// The owner drives this control from a computed whose getter reads the backend's own `selected`
// flag, so a write does NOT come back as a new prop until the search has answered. Passing the
// listener is what makes that real here: without one, `defineModel` keeps the value locally and
// the rail would look correct no matter what it does with the press.
function mountRail(props: Record<string, unknown> = {}) {
  return mount(CategorySort, {
    props: { options: OPTIONS, modelValue: "", "onUpdate:modelValue": () => {}, ...props },
    global: {
      components: { VcTabSwitchGroup, VcTabSwitch },
      stubs: { VcIcon: true },
      mocks: { $t: (key: string) => key },
    },
  });
}

function labelOf(wrapper: ReturnType<typeof mountRail>, index: number) {
  return wrapper.findAllComponents(VcTabSwitch)[index];
}

describe("CategorySort", () => {
  it("shows the short name and keeps the full one as the accessible name", () => {
    const wrapper = mountRail();
    const priceTab = labelOf(wrapper, 1);

    expect(priceTab.text()).toContain("Price ↑");
    expect(priceTab.find("button").attributes("aria-label")).toBe("Price, low to high");
  });

  it("marks the pressed option before the search that it started comes back", async () => {
    const wrapper = mountRail({ loading: false });

    await labelOf(wrapper, 2).find("button").trigger("click");

    // The model has not been answered by the backend yet — the rail still has to look pressed.
    expect(labelOf(wrapper, 2).classes()).toContain(CHECKED);
    expect(wrapper.emitted("change")).toEqual([["createddate-descending"]]);
    expect(wrapper.emitted("update:modelValue")).toEqual([["createddate-descending"]]);
  });

  it("hands the selection back to the backend once the search has settled", async () => {
    const wrapper = mountRail({ loading: false });

    await labelOf(wrapper, 2).find("button").trigger("click");
    expect(labelOf(wrapper, 2).classes()).toContain(CHECKED);

    // The store applied a different sorting than the one pressed, and says so on the way back.
    await wrapper.setProps({ loading: true });
    await wrapper.setProps({ loading: false, modelValue: "price-ascending" });

    expect(labelOf(wrapper, 2).classes()).not.toContain(CHECKED);
    expect(labelOf(wrapper, 1).classes()).toContain(CHECKED);
  });

  it("ignores a press on the option that is already selected", async () => {
    const wrapper = mountRail({ modelValue: "price-ascending" });

    await labelOf(wrapper, 1).find("button").trigger("click");

    expect(wrapper.emitted("change")).toBeUndefined();
  });

  it("checks nothing while the store has not said which sorting it applied", () => {
    const wrapper = mountRail({ modelValue: undefined });

    expect(wrapper.findAll(`.${CHECKED}`)).toHaveLength(0);
  });
});
