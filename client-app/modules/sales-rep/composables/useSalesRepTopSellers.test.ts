import { describe, expect, it, vi } from "vitest";
import { useSalesRepTopSellers } from "./useSalesRepTopSellers";
import type { SalesRepTopSellersQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<SalesRepTopSellersQuery | undefined>(undefined);
  const loading = ref(false);
  const onError = vi.fn();
  const useQuery = vi.fn(() => ({ result, loading, onError }));
  return { result, loading, onError, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US", currencyCode: "USD" } }));

function topSeller(overrides: Record<string, unknown> = {}) {
  return {
    rank: 1,
    productId: "p1",
    name: "Widget",
    sku: "SKU-1",
    imageUrl: "",
    units: 12345,
    revenue: { amount: 12345, formattedAmount: "$12,345.00" },
    ...overrides,
  };
}

describe("useSalesRepTopSellers", () => {
  // VCST-5586: this table sits under the KPI cards on both pages, so its figures have to group the
  // same way — a raw 12345 beside a card's 1,234 is the inconsistency the ticket is about.
  it("groups units through the shared stat formatter", () => {
    queryMock.result.value = { salesRepTopSellers: [topSeller()] } as SalesRepTopSellersQuery;

    const { items } = useSalesRepTopSellers();

    expect(items.value[0].units).toBe("12,345");
    expect(items.value[0].revenue).toBe("$12,345.00");
  });

  it("keeps the backend-formatted revenue string as-is", () => {
    queryMock.result.value = {
      salesRepTopSellers: [topSeller({ units: 7, revenue: { amount: 40, formattedAmount: "40,00 €" } })],
    } as SalesRepTopSellersQuery;

    const { items } = useSalesRepTopSellers();

    expect(items.value[0].units).toBe("7");
    expect(items.value[0].revenue).toBe("40,00 €");
  });
});
