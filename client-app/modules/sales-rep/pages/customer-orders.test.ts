import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setGlobals } from "@/core/globals";
import { createWrapperFactory } from "@/core/utilities/tests";
import { CUSTOMER_PROFILE_ROUTE_NAME } from "../constants";
import CustomerOrders from "./customer-orders.vue";

const state = await vi.hoisted(async () => {
  const { ref, shallowRef } = await import("vue");
  const { vi: vitest } = await import("vitest");
  return {
    orders: shallowRef<Record<string, unknown>[]>([]),
    loading: ref(false),
    pages: ref(1),
    page: ref(1),
    keyword: ref(""),
    sort: ref<unknown>(undefined),
    fetchOrders: vitest.fn(),
    customer: ref<{ organizationName: string } | undefined>({ organizationName: "MERCURY123" }),
    notFound: ref(false),
  };
});

vi.mock("@/shared/account/composables/useUserOrders", async () => {
  const { ref, shallowRef } = await import("vue");
  return {
    facets: shallowRef([]),
    useUserOrders: () => ({
      orders: state.orders,
      loading: state.loading,
      pages: state.pages,
      page: state.page,
      keyword: state.keyword,
      sort: state.sort,
      itemsPerPage: ref(10),
      fetchOrders: state.fetchOrders,
    }),
  };
});
vi.mock("../composables/useSalesRepCustomer", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepCustomer: () => ({ customer: state.customer, loading: ref(false), notFound: state.notFound }),
  };
});
vi.mock("@/core/composables/usePageHead", () => ({ usePageHead: vi.fn() }));
// goToOrderDetails resolves the route through apollo-backed slug info.
vi.mock("@/shared/account/composables/useOrderNavigation", () => ({
  useOrderNavigation: () => ({ goToOrderDetails: vi.fn() }),
}));
vi.mock("vue-router", async () => {
  const actual = await vi.importActual<typeof import("vue-router")>("vue-router");
  return {
    ...actual,
    useRoute: () => ({ path: "/company/my-customers/org-1/orders", params: { organizationId: "org-1" } }),
    useRouter: () => ({ resolve: () => ({ href: "/account/orders/o-1" }), push: vi.fn() }),
  };
});

const BreadcrumbsStub = { props: ["items"], template: '<nav class="crumbs" />' };

const createWrapper = createWrapperFactory(mount, CustomerOrders, {
  props: { organizationId: "org-1" },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcWidget: { template: '<div><slot name="default-container" /></div>' },
      // A real input: Enter has to reach the page's handler.
      VcInput: {
        props: ["modelValue"],
        emits: ["update:modelValue", "clear"],
        template:
          '<input class="search-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      },
      VcBreadcrumbs: BreadcrumbsStub,
      VcTypography: true,
      VcButton: true,
      VcChip: true,
      VcIcon: true,
      VcEmptyView: true,
      OrdersTable: true,
      OrdersDesktopFilters: true,
      OrdersMobileFilters: true,
    },
  },
});

vi.stubGlobal("scroll", vi.fn());

enableAutoUnmount(afterEach);

// findComponent by selector is typed as WrapperLike, which exposes neither vm nor props.
type StubType = {
  exists: () => boolean;
  props: () => Record<string, unknown>;
  attributes: (key: string) => string | undefined;
  vm: { $emit: (event: string, ...args: unknown[]) => void };
};

const stub = (wrapper: ReturnType<typeof createWrapper>, selector: string) =>
  wrapper.findComponent(selector) as unknown as StubType;

const table = (wrapper: ReturnType<typeof createWrapper>) => stub(wrapper, "orders-table-stub");
const lastFilter = () => String(state.fetchOrders.mock.calls.at(-1)?.[1] ?? "");

beforeEach(() => {
  setGlobals({ storeId: "B2B-store", cultureName: "en-US" });
  state.orders.value = [{ id: "o-1", number: "CO260812-00002" }];
  state.loading.value = false;
  state.pages.value = 3;
  state.page.value = 1;
  state.keyword.value = "";
  state.sort.value = undefined;
  state.customer.value = { organizationName: "MERCURY123" };
  state.notFound.value = false;
  state.fetchOrders.mockClear();
});

describe("CustomerOrders", () => {
  it("reads the customer's orders scoped to the current store", () => {
    createWrapper();

    expect(state.fetchOrders).toHaveBeenCalledTimes(1);
    expect(state.fetchOrders.mock.calls[0][0]).toBe("organization");
    expect(lastFilter()).toContain('storeid:"B2B-store"');
  });

  it("commits the keyword on Enter and returns to the first page", async () => {
    const wrapper = createWrapper();
    state.page.value = 3;

    await wrapper.find("input.search-input").setValue("CO260812");
    await wrapper.find("input.search-input").trigger("keydown.enter");

    expect(lastFilter()).toContain("CO260812");
    expect(state.page.value).toBe(1);
  });

  it("keeps the store scope when paging", async () => {
    const wrapper = createWrapper();

    table(wrapper).vm.$emit("pageChanged", 2);
    await flushPromises();

    expect(state.page.value).toBe(2);
    expect(state.fetchOrders).toHaveBeenCalledTimes(2);
    expect(lastFilter()).toContain('storeid:"B2B-store"');
  });

  it("re-reads with the clicked column's sort", async () => {
    const wrapper = createWrapper();

    table(wrapper).vm.$emit("headerClick", { column: "total", direction: "asc" });
    await flushPromises();

    expect(String(state.sort.value)).toBe("total:asc");
    expect(state.fetchOrders).toHaveBeenCalledTimes(2);
  });

  it("never reads orders for a customer the rep does not serve", () => {
    state.notFound.value = true;

    const wrapper = createWrapper();

    expect(state.fetchOrders).not.toHaveBeenCalled();
    expect(wrapper.findAll("vc-empty-view-stub")).toHaveLength(1);
    expect(table(wrapper).exists()).toBe(false);
  });

  it("reloads when the route switches to another customer", async () => {
    const wrapper = createWrapper();

    await wrapper.setProps({ organizationId: "org-2" });

    expect(state.fetchOrders).toHaveBeenCalledTimes(2);
  });

  it("names the failure instead of showing the stale rows as a result", async () => {
    state.fetchOrders.mockRejectedValueOnce(new Error("denied"));

    const wrapper = createWrapper();
    await flushPromises();

    const views = wrapper.findAll("vc-empty-view-stub");
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("links the breadcrumb trail back to the customer profile", () => {
    const wrapper = createWrapper();

    const items = stub(wrapper, "nav.crumbs").props().items as IBreadcrumb[];
    const customerCrumb = items.find((item) => item.title === "MERCURY123");

    expect(customerCrumb?.route).toEqual({ name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: "org-1" } });
  });
});
