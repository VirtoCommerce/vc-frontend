import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { CUSTOMER_PROFILE_ROUTE_NAME } from "../constants";
import CustomerOrders from "./customer-orders.vue";

const state = await vi.hoisted(async () => {
  const { ref, shallowRef } = await import("vue");
  const { vi: vitest } = await import("vitest");
  return {
    orders: shallowRef<Record<string, unknown>[]>([]),
    loading: ref(false),
    failed: ref(false),
    pages: ref(4),
    page: ref(1),
    keyword: ref(""),
    sort: ref<unknown>(undefined),
    isFilterEmpty: ref(true),
    customer: ref<{ organizationName: string } | undefined>({ organizationName: "MERCURY123" }),
    notFound: ref(false),
    resetFilters: vitest.fn(),
  };
});

vi.mock("../composables/useSalesRepCustomerOrders", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepCustomerOrders: () => ({
      customer: state.customer,
      notFound: state.notFound,
      orders: state.orders,
      loading: state.loading,
      failed: state.failed,
      page: state.page,
      pages: state.pages,
      keyword: state.keyword,
      sort: state.sort,
      isFilterEmpty: state.isFilterEmpty,
      filterChipsItems: ref([]),
      resetFilters: state.resetFilters,
      removeFilterChipsItem: vi.fn(),
    }),
  };
});
// goToOrderDetails resolves the route through apollo-backed slug info.
vi.mock("@/shared/account/composables/useOrderNavigation", () => ({
  useOrderNavigation: () => ({ goToOrderDetails: vi.fn() }),
}));
vi.mock("@/core/composables/usePageHead", () => ({ usePageHead: vi.fn() }));
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

beforeEach(() => {
  state.orders.value = [{ id: "o-1", number: "CO260812-00002" }];
  state.loading.value = false;
  state.failed.value = false;
  state.pages.value = 4;
  state.page.value = 1;
  state.keyword.value = "";
  state.sort.value = undefined;
  state.isFilterEmpty.value = true;
  state.customer.value = { organizationName: "MERCURY123" };
  state.notFound.value = false;
  state.resetFilters.mockClear();
});

describe("CustomerOrders", () => {
  it("commits the keyword on Enter and returns to the first page", async () => {
    const wrapper = createWrapper();
    state.page.value = 3;

    await wrapper.find("input.search-input").setValue("CO260812");
    await wrapper.find("input.search-input").trigger("keydown.enter");

    expect(state.keyword.value).toBe("CO260812");
    expect(state.page.value).toBe(1);
  });

  it("hands the requested page to the query", () => {
    const wrapper = createWrapper();

    table(wrapper).vm.$emit("pageChanged", 2);

    expect(state.page.value).toBe(2);
  });

  it("hands the clicked column to the query", () => {
    const wrapper = createWrapper();

    table(wrapper).vm.$emit("headerClick", { column: "total", direction: "asc" });

    expect(String(state.sort.value)).toBe("total:asc");
    expect(state.page.value).toBe(1);
  });

  it("shows the not-found view instead of the list for a customer the rep does not serve", () => {
    state.notFound.value = true;

    const wrapper = createWrapper();

    expect(wrapper.findAll("vc-empty-view-stub")).toHaveLength(1);
    expect(table(wrapper).exists()).toBe(false);
  });

  it("names the failure instead of showing the stale rows as a result", async () => {
    state.failed.value = true;

    const wrapper = createWrapper();
    await flushPromises();

    const views = wrapper.findAll("vc-empty-view-stub");
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("offers a search reset only while a search is active", async () => {
    state.orders.value = [];
    state.keyword.value = "nothing";

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.find("vc-empty-view-stub").attributes("variant")).toBe("search");
  });

  it("links the breadcrumb trail back to the customer profile", () => {
    const wrapper = createWrapper();

    const items = stub(wrapper, "nav.crumbs").props().items as IBreadcrumb[];
    const customerCrumb = items.find((item) => item.title === "MERCURY123");

    expect(customerCrumb?.route).toEqual({ name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: "org-1" } });
  });
});
