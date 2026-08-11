import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed } from "vue";

// The real composable issues a GraphQL query, so it is stubbed and only counted.
const h = vi.hoisted(() => ({ calls: 0 }));

vi.mock("./useSalesRepCustomersCount", () => ({
  useSalesRepCustomersCount: () => {
    h.calls++;
    return { count: computed(() => 42) };
  },
}));

vi.mock("@/core/api/graphql/client", () => ({ apolloClient: {} }));
vi.mock("@vue/apollo-composable", () => ({ provideApolloClient: () => undefined }));

describe("salesRepCustomersCount", () => {
  // The module memoizes its query, so each test needs a fresh instance of it.
  beforeEach(() => {
    vi.resetModules();
    h.calls = 0;
  });

  it("does not query until first read", async () => {
    await import("./sharedSalesRepCustomersCount");

    expect(h.calls).toBe(0);
  });

  it("returns the count when read outside a component scope", async () => {
    const { salesRepCustomersCount } = await import("./sharedSalesRepCustomersCount");

    expect(salesRepCustomersCount()).toBe(42);
  });

  it("reuses one query across repeated reads", async () => {
    const { salesRepCustomersCount } = await import("./sharedSalesRepCustomersCount");

    salesRepCustomersCount();
    salesRepCustomersCount();

    expect(h.calls).toBe(1);
  });
});
