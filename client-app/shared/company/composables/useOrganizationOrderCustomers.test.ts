import { describe, expect, it, vi, beforeEach } from "vitest";
import { effectScope, ref } from "vue";
import { useOrganizationOrderCustomers } from "./useOrganizationOrderCustomers";
import type { Ref } from "vue";

const query = vi.hoisted(() => {
  const state = {} as { result: Ref<unknown>; loading: Ref<boolean>; error: Ref<unknown>; variables: unknown[] };
  return state;
});

vi.mock("@/core/api/graphql/orders", () => ({
  useGetOrganizationOrderCustomersQuery: (variables: Ref<unknown>) => {
    query.variables.push(variables.value);
    return { result: query.result, loading: query.loading, error: query.error, onError: vi.fn() };
  },
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store" } }));
vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn() },
  escapeFilterSyntaxValue: (value: string) => value,
}));

function run() {
  const scope = effectScope();
  const result = scope.run(() => useOrganizationOrderCustomers(() => "org-1"));
  if (!result) {
    throw new Error("the scope did not run");
  }
  return result;
}

beforeEach(() => {
  query.result = ref(undefined);
  query.loading = ref(false);
  query.error = ref(null);
  query.variables = [];
});

describe("useOrganizationOrderCustomers", () => {
  it("asks for the organization's orders in the current store", () => {
    run();

    expect(query.variables).toEqual([{ organizationId: "org-1", filter: 'storeid:"B2B-store"' }]);
  });

  it("reads the accounts from the customer facet, lower-cased", () => {
    query.result.value = {
      organizationOrders: {
        term_facets: [
          { name: "status", terms: [{ term: "New", count: 3 }] },
          {
            name: "CustomerId",
            terms: [
              { term: "U-1", count: 2 },
              { term: "u-2", count: 1 },
            ],
          },
        ],
      },
    };

    expect([...(run().customerIds.value ?? [])]).toEqual(["u-1", "u-2"]);
  });

  it("knows nothing until the orders arrive, or when the read fails", () => {
    expect(run().customerIds.value).toBeUndefined();

    query.error.value = new Error("down");

    expect(run().failed.value).toBe(true);
  });
});
