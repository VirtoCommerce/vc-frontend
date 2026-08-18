import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, shallowRef } from "vue";
import { Sort } from "@/core/types";
import { useSalesRepCustomerOrders } from "./useSalesRepCustomerOrders";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const { vi: vitest } = await import("vitest");
  const response = { items: [{ id: "o-1", number: "CO260812-00002" }], totalCount: 34, term_facets: [] };
  return {
    getOrganizationOrders: vitest.fn().mockResolvedValue(response),
    appliedFilterData: ref<{ statuses: string[] }>({ statuses: [] }),
    resetFilters: vitest.fn(),
    setFacetsLocalization: vitest.fn(),
    customerLoading: ref(false),
    notFound: ref(false),
  };
});

vi.mock("@/core/api/graphql/orders", () => ({
  getOrders: vi.fn(),
  getOrganizationOrders: state.getOrganizationOrders,
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US" } }));
vi.mock("@/shared/account/composables/useUserOrdersFilter", async () => {
  const actual = await vi.importActual<typeof import("@/shared/account/composables/useUserOrdersFilter")>(
    "@/shared/account/composables/useUserOrdersFilter",
  );
  const { computed, ref } = await import("vue");
  return {
    getFilterExpression: actual.getFilterExpression,
    useUserOrdersFilter: () => ({
      appliedFilterData: computed(() => state.appliedFilterData.value),
      isFilterEmpty: computed(() => state.appliedFilterData.value.statuses.length === 0),
      filterChipsItems: ref([]),
      resetFilters: state.resetFilters,
      removeFilterChipsItem: vi.fn(),
      setFacetsLocalization: state.setFacetsLocalization,
    }),
  };
});
vi.mock("./useSalesRepCustomer", async () => {
  const { computed, ref } = await import("vue");
  return {
    useSalesRepCustomer: () => ({
      customer: ref({ organizationName: "MERCURY123" }),
      loading: state.customerLoading,
      notFound: computed(() => state.notFound.value),
    }),
  };
});

// Each composable keeps watchers on state shared with every other instance, so they are scoped per test.
let scope: ReturnType<typeof effectScope> | undefined;

function create(organizationId: Parameters<typeof useSalesRepCustomerOrders>[0]) {
  scope = effectScope();
  return scope.run(() => useSalesRepCustomerOrders(organizationId))!;
}

afterEach(() => {
  scope?.stop();
  scope = undefined;
});

const lastFilter = () =>
  String((state.getOrganizationOrders.mock.calls.at(-1)?.[0] as { filter?: string })?.filter ?? "");
const lastPayload = () => state.getOrganizationOrders.mock.calls.at(-1)?.[0] as Record<string, unknown>;

beforeEach(() => {
  state.appliedFilterData.value = { statuses: [] };
  state.customerLoading.value = false;
  state.notFound.value = false;
  state.getOrganizationOrders.mockClear();
  state.getOrganizationOrders.mockResolvedValue({
    items: [{ id: "o-1", number: "CO260812-00002" }],
    totalCount: 34,
    term_facets: [],
  });
});

describe("useSalesRepCustomerOrders", () => {
  // organizationOrders is store-blind, so without the clause another store's orders would be listed.
  it("reads the customer's orders scoped to the current store", async () => {
    const { pages } = create("org-1");
    await nextTick();

    expect(state.getOrganizationOrders).toHaveBeenCalledTimes(1);
    expect(lastPayload().organizationId).toBe("org-1");
    expect(lastFilter()).toContain('storeid:"test-store"');
    expect(pages.value).toBe(4);
  });

  it("re-reads with the keyword and keeps the store clause", async () => {
    const { keyword } = create("org-1");

    keyword.value = "CO260812";
    await nextTick();

    expect(lastFilter()).toBe('CO260812 storeid:"test-store"');
  });

  it("turns the page into the connection offset", async () => {
    const { page } = create("org-1");

    page.value = 2;
    await nextTick();

    expect(lastPayload().after).toBe("10");
  });

  it("re-reads with the requested sort", async () => {
    const { sort } = create("org-1");

    sort.value = new Sort("total", "asc");
    await nextTick();

    expect(lastPayload().sort).toBe("total:asc");
  });

  it("carries an applied status filter into the expression", async () => {
    create("org-1");

    state.appliedFilterData.value = { statuses: ["New"] };
    await nextTick();

    expect(lastFilter()).toBe('status:"New" storeid:"test-store"');
  });

  it("never reads orders for a customer the rep does not serve", () => {
    state.notFound.value = true;

    create("org-1");

    expect(state.getOrganizationOrders).not.toHaveBeenCalled();
  });

  it("waits for the customer before reading", async () => {
    state.customerLoading.value = true;

    create("org-1");
    expect(state.getOrganizationOrders).not.toHaveBeenCalled();

    state.customerLoading.value = false;
    await nextTick();

    expect(state.getOrganizationOrders).toHaveBeenCalledTimes(1);
  });

  it("reports a failed read", async () => {
    state.getOrganizationOrders.mockRejectedValueOnce(new Error("denied"));

    const { failed } = create("org-1");
    await nextTick();
    await nextTick();

    expect(failed.value).toBe(true);
  });

  it("returns to the first page when the route switches to another customer", async () => {
    const organizationId = shallowRef("org-1");
    const { page } = create(organizationId);
    page.value = 3;
    await nextTick();

    organizationId.value = "org-2";
    await nextTick();

    expect(page.value).toBe(1);
    expect(lastPayload().organizationId).toBe("org-2");
    expect(lastPayload().after).toBe("0");
  });

  // Filter state is shared with the buyer's own Orders list.
  it("clears filters left over from another orders list", () => {
    create("org-1");

    expect(state.resetFilters).toHaveBeenCalled();
  });
});
