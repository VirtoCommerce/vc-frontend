import { ApolloClient, ApolloLink, InMemoryCache, Observable } from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import CustomerProfile from "./customer-profile.vue";

// The customer read is mocked to a settled answer; below it, the page's statistics run for real — the widgets
// composable, both statistics queries and Apollo — and the link records every operation that leaves the page.
const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    customer: ref<{ organizationId: string; organizationName: string } | undefined>(undefined),
    loading: ref(false),
    failed: ref(false),
    notFound: ref(false),
  };
});

vi.mock("../composables/useSalesRepCustomer", () => ({ useSalesRepCustomer: () => state }));

// The layout has been read and shows every card, so the customer is the only thing the statistics wait for.
vi.mock("../composables/useSalesRepLayout", async () => {
  const { computed } = await import("vue");
  const { CUSTOMER_PROFILE_STAT_CARDS } = await import("../layout/stat-cards");
  return {
    useSalesRepLayout: () => ({
      scope: "customerProfile",
      settled: computed(() => true),
      editing: computed(() => false),
      visibleIn: () => CUSTOMER_PROFILE_STAT_CARDS.map((card) => card.key),
    }),
  };
});

vi.mock("@/core/composables", async () => {
  const { computed, unref } = await import("vue");
  return {
    useBreadcrumbs: (sources: unknown) =>
      computed(() => (typeof sources === "function" ? (sources as () => IBreadcrumb[])() : unref(sources))),
    usePageHead: vi.fn(),
  };
});

vi.mock("@/core/globals", () => ({
  globals: { storeId: "test-store", currencyCode: "USD", cultureName: "en-US" },
}));

const STATISTICS = ["SalesRepCustomerOrderStatistics", "SalesRepCustomerCartStatistics"];

const operations: string[] = [];

// Records and never answers: only whether a request was sent matters here.
const link = new ApolloLink(
  (operation) =>
    new Observable(() => {
      operations.push(operation.operationName);
    }),
);

const createWrapper = createWrapperFactory(mount, CustomerProfile, {
  props: { organizationId: "org-1" },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcBreadcrumbs: true,
      VcEmptyView: true,
      VcButton: true,
      VcTypography: true,
      VcImage: true,
      VcIcon: true,
      LayoutSurface: true,
    },
  },
});

/** Apollo starts a query that `enabled` let through on a later tick. */
async function settle(): Promise<void> {
  for (let round = 0; round < 5; round += 1) {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve));
  }
}

enableAutoUnmount(afterEach);

beforeEach(() => {
  operations.length = 0;
  state.customer.value = undefined;
  state.loading.value = false;
  state.failed.value = false;
  state.notFound.value = false;
  provideApolloClient(new ApolloClient({ link, cache: new InMemoryCache() }));
});

describe("CustomerProfile statistics", () => {
  // The page shows "not found" for an organization the rep does not serve, so nothing may be asked about it.
  it("sends no statistics query for a customer that was not found", async () => {
    state.notFound.value = true;

    createWrapper();
    await settle();

    expect(operations.filter((name) => STATISTICS.includes(name))).toEqual([]);
  });

  it("sends none for a customer whose read failed either", async () => {
    state.failed.value = true;

    createWrapper();
    await settle();

    expect(operations.filter((name) => STATISTICS.includes(name))).toEqual([]);
  });

  // The control: the same page with the customer found does query — so the cases above are not passing
  // because nothing could have fired.
  it("queries both statistics once the customer is found", async () => {
    state.customer.value = { organizationId: "org-1", organizationName: "Acme" };

    createWrapper();
    await settle();

    expect(operations).toEqual(expect.arrayContaining(STATISTICS));
  });

  // Moving to another customer reuses the page, and its previous customer must not open the gate for the next.
  it("waits for the new customer when the page moves to another organization", async () => {
    state.customer.value = { organizationId: "org-1", organizationName: "Acme" };

    createWrapper({ props: { organizationId: "org-2" } });
    await settle();

    expect(operations.filter((name) => STATISTICS.includes(name))).toEqual([]);
  });
});
