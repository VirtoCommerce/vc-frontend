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
  // productId is non-null by contract: it falls back to the tracked code, so an unresolved row is the
  // one whose productId still equals its sku — that, not a missing id, is what clears isResolved.
  it("maps rows, blanking absent display fields and flagging the unresolved code", () => {
    queryMock.result.value = {
      salesRepCustomerInsights: {
        dataAsOf: "2026-08-20T00:00:00Z",
        browsedProducts: [
          { productId: "p1", name: "Drill", sku: "SKU-1", imageUrl: "img", viewCount: 4 },
          // GA row the backend could not resolve: productId came back as the tracked code itself.
          { productId: "CODE-2", sku: "CODE-2", viewCount: 1 },
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
        productId: "CODE-2",
        name: "",
        sku: "CODE-2",
        imageUrl: "",
        isResolved: false,
        viewCount: 1,
        lastViewedDate: undefined,
      },
    ]);
  });

  it("flags not-configured on a null payload, but never before a result arrives", () => {
    const { notConfigured } = useSalesRepBrowseHistory({ organizationId: "org-1" });

    expect(notConfigured.value).toBe(false);

    // The backend answers null for "no insights provider"; codegen's Maybe<T> = T mapping erases
    // the null, so the fixture casts to what actually arrives on the wire.
    queryMock.result.value = { salesRepCustomerInsights: null } as unknown as SalesRepCustomerBrowsedProductsQuery;

    expect(notConfigured.value).toBe(true);
  });

  it("surfaces the query error so the widget can show a failure state", () => {
    const { error } = useSalesRepBrowseHistory({ organizationId: "org-1" });

    expect(error).toBe(queryMock.error);
  });
});
