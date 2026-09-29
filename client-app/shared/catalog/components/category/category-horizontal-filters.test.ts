import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, ref } from "vue";
import CategoryHorizontalFilters from "./category-horizontal-filters.vue";
import VcRadioButton from "@/ui-kit/components/atoms/radio-button/vc-radio-button.vue";
import VcMenuItem from "@/ui-kit/components/molecules/menu-item/vc-menu-item.vue";

const sortQueryParam = vi.hoisted(() => ({ value: "" }));
/** What the backend says is applied, which the rail's checkmark follows and the URL need not match. */
const backendSelected = vi.hoisted(() => ({ value: "" }));
const close = vi.hoisted(() => vi.fn());

// Mocked at its own module, not at the barrel: `export *` re-exports this one, and replacing the
// whole barrel would hand every other composable back as undefined.
vi.mock("@/core/composables/useRouteQueryParam", () => ({
  useRouteQueryParam: () => sortQueryParam,
}));

vi.mock("@/shared/catalog/composables/useProductSortings", () => ({
  useProductSortings: () => ({
    sortList: ref([
      { id: "", name: "Featured", shortName: "Featured" },
      { id: "price-ascending", name: "Price, low to high", shortName: "Price up" },
    ]),
    // The real one is a writable computed whose setter writes `sortQueryParam` — the second writer
    // the handler's guard has to survive.
    selectedSort: computed<string | undefined>({
      get: () => backendSelected.value,
      set: (value) => {
        sortQueryParam.value = value ?? "";
      },
    }),
  }),
}));

vi.mock("@/shared/catalog/components/products-filters.vue", () => ({
  default: defineComponent({
    name: "products-filters",

    setup:
      (_props, { slots }) =>
      () =>
        h("div", slots.prepend?.()),
  }),
}));

function mountFilters(url = "", selected = "") {
  sortQueryParam.value = url;
  backendSelected.value = selected;
  close.mockClear();

  return mount(CategoryHorizontalFilters, {
    props: {
      loading: false,
      filters: { facets: [], filters: [], inStock: false, purchasedBefore: false, branches: [] },
    },
    global: {
      // The real pair, because the guard is only safe while `VcMenuItem` keeps `VcRadioButton` from
      // rendering an input of its own — a stub would answer for both of them.
      components: { VcMenuItem, VcRadioButton },
      stubs: {
        VcButton: true,
        VcInputDetails: true,
        VcDropdownMenu: defineComponent({
          name: "vc-dropdown-menu",

          setup:
            (_props, { slots }) =>
            () =>
              h("div", slots.content?.({ close }) ?? []),
        }),
      },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("CategoryHorizontalFilters sorting", () => {
  it("leaves the sortings' radios without an input of their own, so the press has one writer", () => {
    const wrapper = mountFilters();

    expect(wrapper.findAll(".vc-radio-button")).toHaveLength(2);
    expect(wrapper.findAll("input")).toHaveLength(0);
  });

  it("asks for a sorting the reader has actually changed to", async () => {
    const wrapper = mountFilters();

    await wrapper.findAll("button.vc-menu-item__inner")[1].trigger("click");

    expect(sortQueryParam.value).toBe("price-ascending");
    expect(wrapper.emitted("applySort")).toHaveLength(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("asks for nothing when the sorting pressed is the one already applied, and still closes", async () => {
    const wrapper = mountFilters("price-ascending", "price-ascending");

    await wrapper.findAll("button.vc-menu-item__inner")[1].trigger("click");

    expect(wrapper.emitted("applySort")).toBeUndefined();
    expect(sortQueryParam.value).toBe("price-ascending");
    expect(close).toHaveBeenCalledTimes(1);
  });
});
