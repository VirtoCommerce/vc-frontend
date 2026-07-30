import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { PAGE_SIZE, useSalesRepCustomers } from "./useSalesRepCustomers";
import type { SalesRepCustomersQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<SalesRepCustomersQuery | undefined>(undefined);
  const loading = ref(false);
  const onError = vi.fn();
  const useQuery = vi.fn(() => ({
    result,
    loading,
    onError,
  }));
  return { result, loading, onError, useQuery };
});

/** The args of the most recent useQuery call (the impl is param-less, so read them here). */
function lastCallArgs(): unknown[] {
  return queryMock.useQuery.mock.calls.at(-1) ?? [];
}

vi.mock("@vue/apollo-composable", () => ({
  useQuery: queryMock.useQuery,
}));

vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US", currencyCode: "USD" } }));

function customersResult(totalCount: number, items: NonNullable<SalesRepCustomersQuery["salesRepCustomers"]>["items"]) {
  return { salesRepCustomers: { totalCount, items } };
}

/** The reactive `variables` computed the composable handed to useQuery. */
function passedVariables(): {
  storeId?: string;
  first: number;
  after: string;
  keyword: string;
  sort?: string;
  filter?: string;
  cultureName?: string;
  ytdFrom?: string;
  ytdTo?: string;
  lastYearFrom?: string;
  lastYearTo?: string;
} {
  const variables = lastCallArgs()[1] as { value: ReturnType<typeof passedVariables> } | undefined;
  if (!variables) {
    throw new Error("useQuery was not called with variables");
  }
  return variables.value;
}

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.loading.value = false;
  queryMock.useQuery.mockClear();
  queryMock.onError.mockClear();
});

describe("useSalesRepCustomers", () => {
  it("queries server-side with offset-as-cursor paging, applied keyword, and named sort/filter rules", () => {
    const { page, sortRule, filter, keyword } = useSalesRepCustomers();

    // Scoped to the current store (globals.storeId); default sort/filter omitted → server defaults
    // (my-last-orders / All). The YTD / prior-year windows are asserted separately below.
    expect(passedVariables()).toMatchObject({
      storeId: "test-store",
      first: PAGE_SIZE,
      after: "0",
      keyword: "",
      cultureName: "en-US",
      sort: undefined,
      filter: undefined,
    });

    // The inline YTD / prior-year purchase columns pass ISO date windows computed at runtime.
    const windows = passedVariables();
    for (const bound of [windows.ytdFrom, windows.ytdTo, windows.lastYearFrom, windows.lastYearTo]) {
      expect(bound).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }

    page.value = 3;
    expect(passedVariables().after).toBe(String((3 - 1) * PAGE_SIZE));

    // Sort and filter are single named rules (a sort-rule name and a filter/segment name).
    sortRule.value = "ytd-purchases";
    expect(passedVariables().sort).toBe("ytd-purchases");

    filter.value = "active";
    expect(passedVariables().filter).toBe("active");

    // `keyword` is the applied term (the page sets it on enter/click) — it flows straight into
    // the query with no debounce of its own.
    keyword.value = "Cottage";
    expect(passedVariables().keyword).toBe("Cottage");
  });

  it("requests keepPreviousResult so the table doesn't flash empty between pages", () => {
    useSalesRepCustomers();
    const options = lastCallArgs()[2] as { keepPreviousResult?: boolean };
    expect(options.keepPreviousResult).toBe(true);
  });

  it("maps SalesRepCustomer to the view shape, tolerating missing fields and no last order", () => {
    const { items } = useSalesRepCustomers();
    queryMock.result.value = customersResult(2, [
      {
        organizationId: "org-1",
        organizationName: "The Cottage Shop LLC",
        accountType: "Garden Center",
        address: { postalCode: "22902", city: "Charlottesville", regionName: "Virginia" },
        ytd: { count: 13, total: { amount: 72165, formattedAmount: "$72,165.00" } },
        lastYear: { count: 11, total: { amount: 64420, formattedAmount: "$64,420.00" } },
        lastOrder: { id: "o-1", number: "21580221", createdDate: "2026-05-19T00:00:00Z" },
      },
      { organizationId: "org-2", organizationName: "No Orders Inc" }, // address, stats and lastOrder absent
    ]);

    expect(items.value).toEqual([
      {
        organizationId: "org-1",
        organizationName: "The Cottage Shop LLC",
        accountType: "Garden Center",
        // Postal code ("#"-prefixed), city and region as three middot-separated segments.
        location: "#22902 · Charlottesville · Virginia",
        ytdTotal: "$72,165.00",
        ytdCount: "13",
        lastYearTotal: "$64,420.00",
        lastOrder: { id: "o-1", number: "21580221", createdDate: "2026-05-19T00:00:00Z" },
      },
      // No address → empty string; absent statistics read as zeros, never as blanks or dashes (VCST-5586).
      {
        organizationId: "org-2",
        organizationName: "No Orders Inc",
        accountType: "",
        location: "",
        ytdTotal: "$0.00",
        ytdCount: "0",
        lastYearTotal: "$0.00",
        lastOrder: undefined,
      },
    ]);
  });

  it("derives pages from totalCount, never below 1", () => {
    const { pages } = useSalesRepCustomers();

    expect(pages.value).toBe(1); // no result yet

    queryMock.result.value = customersResult(0, []);
    expect(pages.value).toBe(1);

    queryMock.result.value = customersResult(PAGE_SIZE * 2 + 1, []);
    expect(pages.value).toBe(3);
  });

  it("clamps the current page when the result set shrinks below it", async () => {
    const { page, pages } = useSalesRepCustomers();

    queryMock.result.value = customersResult(PAGE_SIZE * 3, []); // 3 pages
    page.value = 3;
    await nextTick();
    expect(page.value).toBe(3); // still valid — no clamp

    queryMock.result.value = customersResult(PAGE_SIZE, []); // shrinks to 1 page
    await nextTick();
    expect(pages.value).toBe(1);
    expect(page.value).toBe(1); // clamped back to the last valid page
  });

  it("passes loading through and registers an error handler", () => {
    const { loading } = useSalesRepCustomers();

    queryMock.loading.value = true;
    expect(loading.value).toBe(true);

    expect(queryMock.onError).toHaveBeenCalledTimes(1);
  });
});
