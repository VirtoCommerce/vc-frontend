import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesRepBrowseHistory } from "./useSalesRepBrowseHistory";
import type { SalesRepCustomerBrowsedProductsQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<SalesRepCustomerBrowsedProductsQuery | undefined>(undefined);
  const loading = ref(false);
  const onError = vi.fn();
  const error = ref<Error | null>(null);
  const useQuery = vi.fn(() => ({ result, loading, error, onError }));
  return { result, loading, error, onError, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US" } }));

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.error.value = null;
  queryMock.loading.value = false;
});

describe("useSalesRepBrowseHistory", () => {
  it("maps rows, blanking absent display fields and flagging the unresolved code", () => {
    queryMock.result.value = {
      salesRepCustomerInsights: {
        isAnalyticsAvailable: true,
        dataAsOf: "2026-08-20T00:00:00Z",
        browsedProducts: [
          { productId: "p1", name: "Drill", sku: "SKU-1", imageUrl: "img", viewCount: 4 },
          // GA row the backend could not resolve: no productId.
          { sku: "CODE-2", viewCount: 1 },
        ],
      },
    } satisfies SalesRepCustomerBrowsedProductsQuery;

    const { items } = useSalesRepBrowseHistory({ organizationId: "org-1" });

    expect(items.value).toEqual([
      {
        productId: "p1",
        name: "Drill",
        sku: "SKU-1",
        imageUrl: "img",
        isResolved: true,
        viewCount: 4,
        lastViewedDate: undefined,
      },
      {
        productId: "",
        name: "",
        sku: "CODE-2",
        imageUrl: "",
        isResolved: false,
        viewCount: 1,
        lastViewedDate: undefined,
      },
    ]);
  });

  // In a catalog whose product ids equal their codes, the old `productId !== sku` test read every row as
  // unresolved, so none of them ever got a link.
  it("keeps a resolved product resolved when its id equals its code", () => {
    queryMock.result.value = {
      salesRepCustomerInsights: {
        isAnalyticsAvailable: true,
        browsedProducts: [{ productId: "SKU-1", sku: "SKU-1", viewCount: 2 }],
      },
    } satisfies SalesRepCustomerBrowsedProductsQuery;

    const { items } = useSalesRepBrowseHistory({ organizationId: "org-1" });

    expect(items.value[0].isResolved).toBe(true);
  });

  it("flags unavailable from the backend flag, but never before a result arrives", () => {
    const { unavailable } = useSalesRepBrowseHistory({ organizationId: "org-1" });

    expect(unavailable.value).toBe(false);

    // One flag covers analytics absent, unconfigured, and a read that failed.
    queryMock.result.value = {
      salesRepCustomerInsights: { isAnalyticsAvailable: false, browsedProducts: [] },
    };

    expect(unavailable.value).toBe(true);
  });

  // A null payload means only that the caller may not see this customer.
  it("does not flag unavailable on a null payload", () => {
    const { unavailable } = useSalesRepBrowseHistory({ organizationId: "org-1" });

    queryMock.result.value = { salesRepCustomerInsights: null } as unknown as SalesRepCustomerBrowsedProductsQuery;

    expect(unavailable.value).toBe(false);
  });

  it("keeps the op out of the shared cache", () => {
    useSalesRepBrowseHistory({ organizationId: "org-1" });

    const call = (queryMock.useQuery.mock.calls.at(-1) ?? []) as unknown[];
    const options = call[2] as { fetchPolicy?: string } | undefined;
    expect(options?.fetchPolicy).toBe("no-cache");
  });

  it("dates the list from its own rows", () => {
    queryMock.result.value = {
      salesRepCustomerInsights: {
        isAnalyticsAvailable: true,
        dataAsOf: "2026-08-31T00:00:00Z",
        browsedProducts: [
          { productId: "p1", sku: "SKU-1", viewCount: 4, lastViewedDate: "2026-08-19T10:00:00Z" },
          { productId: "p2", sku: "SKU-2", viewCount: 2, lastViewedDate: "2026-08-22T08:00:00Z" },
        ],
      },
    } satisfies SalesRepCustomerBrowsedProductsQuery;

    const { dataAsOf } = useSalesRepBrowseHistory({ organizationId: "org-1" });

    expect(dataAsOf.value).toBe("2026-08-22T08:00:00Z");
  });

  it("surfaces the query error so the widget can show a failure state", () => {
    const { error } = useSalesRepBrowseHistory({ organizationId: "org-1" });

    expect(error).toBe(queryMock.error);
  });
});
