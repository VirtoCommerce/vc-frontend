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
        isAnalyticsAvailable: true,
        dataAsOf: "2026-08-20T00:00:00Z",
        searchTerms: [{ term: "gloves", count: 12, lastSearchedDate: "2026-08-19T10:00:00Z" }],
      },
    } satisfies SalesRepCustomerSearchTermsQuery;

    const { items, unavailable } = useSalesRepSearchHistory({ organizationId: "org-1" });

    expect(items.value).toEqual([{ term: "gloves", count: 12, lastSearchedDate: "2026-08-19T10:00:00Z" }]);
    expect(unavailable.value).toBe(false);
  });

  // The payload's own dataAsOf is deliberately NOT read: both insights ops select the same root field
  // with the same arguments, so Apollo keeps one normalized entry and an argument-less dataAsOf in it
  // ends up whichever op answered last. Here the payload claims a date the rows do not support, which
  // is exactly the shape of that bug — the browsed-products op having written it.
  it("dates the list from its own rows, not from the shared payload field", () => {
    queryMock.result.value = {
      salesRepCustomerInsights: {
        isAnalyticsAvailable: true,
        dataAsOf: "2026-08-31T00:00:00Z",
        searchTerms: [
          { term: "gloves", count: 12, lastSearchedDate: "2026-08-19T10:00:00Z" },
          { term: "bolts", count: 3, lastSearchedDate: "2026-08-21T09:00:00Z" },
        ],
      },
    } satisfies SalesRepCustomerSearchTermsQuery;

    const { dataAsOf } = useSalesRepSearchHistory({ organizationId: "org-1" });

    expect(dataAsOf.value).toBe("2026-08-21T09:00:00Z");
  });

  // Sort "count" returns aggregate rows that carry no dates at all, so there is no date to show —
  // and borrowing the other list's would misdate this one.
  it("reports no date when the rows carry none", () => {
    queryMock.result.value = {
      salesRepCustomerInsights: {
        isAnalyticsAvailable: true,
        dataAsOf: "2026-08-31T00:00:00Z",
        searchTerms: [{ term: "gloves", count: 12 }],
      },
    } satisfies SalesRepCustomerSearchTermsQuery;

    const { dataAsOf } = useSalesRepSearchHistory({ organizationId: "org-1" });

    expect(dataAsOf.value).toBeUndefined();
  });

  it("flags unavailable from the backend flag, but never before a result arrives", () => {
    const { unavailable } = useSalesRepSearchHistory({ organizationId: "org-1" });

    // No result yet (loading or failed) must not read as unavailable.
    expect(unavailable.value).toBe(false);

    // One flag covers analytics absent, unconfigured, and a read that failed.
    queryMock.result.value = {
      salesRepCustomerInsights: { isAnalyticsAvailable: false, searchTerms: [] },
    };

    expect(unavailable.value).toBe(true);
  });

  // A null payload now means only that the caller may not see this customer — not that analytics is
  // unavailable. Reading it as unavailable would put the wrong message on a rep with no organizations.
  it("does not flag unavailable on a null payload", () => {
    const { unavailable } = useSalesRepSearchHistory({ organizationId: "org-1" });

    queryMock.result.value = { salesRepCustomerInsights: null } as unknown as SalesRepCustomerSearchTermsQuery;

    expect(unavailable.value).toBe(false);
  });

  it("surfaces the query error so the widget can show a failure state", () => {
    const { error } = useSalesRepSearchHistory({ organizationId: "org-1" });

    expect(error).toBe(queryMock.error);
  });
});
