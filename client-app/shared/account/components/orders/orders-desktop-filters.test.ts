import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import OrdersDesktopFilters from "./orders-desktop-filters.vue";

vi.mock("../../composables/useUserOrdersFilter", () => ({
  useUserOrdersFilter: () => ({
    filterData: ref({ statuses: [], customerNames: [] }),
    selectedDateFilterType: ref(undefined),
    handleOrdersDateFilterChange: () => {},
    applyFilters: () => {},
    resetFilters: () => {},
    showCustomerNameFilter: ref(false),
    organizationCustomerNames: ref([]),
  }),
}));

// Declares the props the drawer opts into, so a stub cannot silently swallow them (VCST-5869).
const PopoverStub = defineComponent({
  name: "VcPopover",

  props: {
    role: { type: String, default: undefined },
    ariaLabel: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
  },

  template: `<div><slot :trigger-props="{}" /><slot name="content" :close="() => {}" /></div>`,
});

function mountFilters(loading = false) {
  return shallowMount(OrdersDesktopFilters, {
    props: { orderScope: "private" as const, loading },
    global: {
      stubs: { VcPopover: PopoverStub, VcButton: true, VcIcon: true, VcSelect: true },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("OrdersDesktopFilters", () => {
  it("declares its panel a dialog and names it", () => {
    const popover = mountFilters().findComponent(PopoverStub);

    expect(popover.props("role")).toBe("dialog");
    expect(popover.props("ariaLabel")).toBe("shared.account.orders_filter.title");
  });

  it("disables the popover while the list reloads, so it cannot be opened over stale facets", () => {
    expect(mountFilters(true).findComponent(PopoverStub).props("disabled")).toBe(true);
    expect(mountFilters(false).findComponent(PopoverStub).props("disabled")).toBe(false);
  });
});
