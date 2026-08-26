import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesRepSearchHistory } from "./useSalesRepSearchHistory";
import type { SalesRepCustomerSearchTermsQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<SalesRepCustomerSearchTermsQuery | undefined>(undefined);
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

describe("useSalesRepSearchHistory", () => {
  it("maps the payload rows and keeps counts numeric for plural selection", () => {
    queryMock.result.value = {
      salesRepCustomerInsights: {
        dataAsOf: "2026-08-20T00:00:00Z",
        searchTerms: [{ term: "gloves", count: 12, lastSearchedDate: "2026-08-19T10:00:00Z" }],
      },
    } satisfies SalesRepCustomerSearchTermsQuery;

    const { items, dataAsOf, notConfigured } = useSalesRepSearchHistory({ organizationId: "org-1" });

    expect(items.value).toEqual([{ term: "gloves", count: 12, lastSearchedDate: "2026-08-19T10:00:00Z" }]);
    expect(dataAsOf.value).toBe("2026-08-20T00:00:00Z");
    expect(notConfigured.value).toBe(false);
  });

  it("flags not-configured on a null payload, but never before a result arrives", () => {
    const { notConfigured } = useSalesRepSearchHistory({ organizationId: "org-1" });

    // No result yet (loading or failed) must not read as "not configured".
    expect(notConfigured.value).toBe(false);

    // The backend answers null for "no insights provider"; codegen's Maybe<T> = T mapping erases
    // the null, so the fixture casts to what actually arrives on the wire.
    queryMock.result.value = { salesRepCustomerInsights: null } as unknown as SalesRepCustomerSearchTermsQuery;

    expect(notConfigured.value).toBe(true);
  });

  it("surfaces the query error so the widget can show a failure state", () => {
    const { error } = useSalesRepSearchHistory({ organizationId: "org-1" });

    expect(error).toBe(queryMock.error);
  });
});
