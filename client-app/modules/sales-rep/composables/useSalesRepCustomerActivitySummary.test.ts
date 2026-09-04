import { describe, expect, it, vi } from "vitest";
import { useSalesRepCustomerActivitySummary } from "./useSalesRepCustomerActivitySummary";
import type { SalesRepCustomerActivitySummaryQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<SalesRepCustomerActivitySummaryQuery | undefined>(undefined);
  const loading = ref(false);
  const onError = vi.fn();
  const error = ref<Error | null>(null);
  const useQuery = vi.fn(() => ({ result, loading, error, onError }));
  return { result, loading, error, onError, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US", currencyCode: "USD" } }));

describe("useSalesRepCustomerActivitySummary", () => {
  it("maps a configured-analytics summary including the resolved product", () => {
    queryMock.result.value = {
      salesRepCustomerActivitySummary: {
        createdOn: "2024-01-05T00:00:00Z",
        lastWebLogin: "2026-08-20T10:00:00Z",
        visitsCount: 12,
        lastSearchTerm: "gloves",
        isAnalyticsConfigured: true,
        lastViewedProduct: { code: "SKU-1", productId: "p1", name: "Gloves", imageUrl: "img" },
      },
    } satisfies SalesRepCustomerActivitySummaryQuery;

    const { summary } = useSalesRepCustomerActivitySummary("org1");

    expect(summary.value).toEqual({
      createdOn: "2024-01-05T00:00:00Z",
      lastWebLogin: "2026-08-20T10:00:00Z",
      visitsCount: 12,
      lastSearchTerm: "gloves",
      isAnalyticsConfigured: true,
      lastViewedProduct: { code: "SKU-1", productId: "p1", name: "Gloves", imageUrl: "img" },
    });
  });

  // Analytics off is NOT an error by contract: createdOn still arrives from the DB while the
  // GA-sourced fields settle to empty — the widget renders its distinct not-configured state from this.
  it("keeps createdOn while flagging analytics as unconfigured", () => {
    queryMock.result.value = {
      salesRepCustomerActivitySummary: {
        createdOn: "2024-01-05T00:00:00Z",
        visitsCount: 0,
        isAnalyticsConfigured: false,
      },
    } satisfies SalesRepCustomerActivitySummaryQuery;

    const { summary } = useSalesRepCustomerActivitySummary("org1");

    expect(summary.value).toMatchObject({
      createdOn: "2024-01-05T00:00:00Z",
      isAnalyticsConfigured: false,
      visitsCount: 0,
      lastSearchTerm: "",
      lastViewedProduct: undefined,
    });
  });

  // A foreign/unauthorized organizationId nulls the whole field — undefined summary, never an error.
  it("settles to no summary when the whole field is null", () => {
    queryMock.result.value = { salesRepCustomerActivitySummary: undefined };

    const { summary } = useSalesRepCustomerActivitySummary("other-org");

    expect(summary.value).toBeUndefined();
  });

  it("surfaces the query error so the widget can show a failure state", () => {
    const { error } = useSalesRepCustomerActivitySummary("org1");

    expect(error).toBe(queryMock.error);
  });
});
