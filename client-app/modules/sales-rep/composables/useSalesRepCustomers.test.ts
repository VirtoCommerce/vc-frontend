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

vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store" } }));

function customersResult(totalCount: number, items: NonNullable<SalesRepCustomersQuery["salesRepCustomers"]>["items"]) {
  return { salesRepCustomers: { totalCount, items } };
}

/** The reactive `variables` computed the composable handed to useQuery. */
function passedVariables(): { storeId?: string; first: number; after: string; keyword: string; sort: string } {
  const variables = lastCallArgs()[1] as
    { value: { storeId?: string; first: number; after: string; keyword: string; sort: string } } | undefined;
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
  it("queries server-side with offset-as-cursor paging, applied keyword, and column:direction sort", () => {
    const { page, sort, keyword } = useSalesRepCustomers();

    // Scoped to the current store (globals.storeId) so customers from another store don't leak in.
    expect(passedVariables()).toEqual({
      storeId: "test-store",
      first: PAGE_SIZE,
      after: "0",
      keyword: "",
      sort: "name:asc",
    });

    page.value = 3;
    expect(passedVariables().after).toBe(String((3 - 1) * PAGE_SIZE));

    sort.value = { column: "name", direction: "desc" };
    expect(passedVariables().sort).toBe("name:desc");

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
        address: { postalCode: "22902", city: "Charlottesville", regionName: "Virginia" },
        lastOrder: { id: "o-1", number: "21580221", createdDate: "2026-05-19T00:00:00Z" },
      },
      { organizationId: "org-2", organizationName: "No Orders Inc" }, // address and lastOrder absent
    ]);

    expect(items.value).toEqual([
      {
        organizationId: "org-1",
        organizationName: "The Cottage Shop LLC",
        // Postal code ("#"-prefixed), city and region as three middot-separated segments.
        location: "#22902 · Charlottesville · Virginia",
        lastOrder: { id: "o-1", number: "21580221", createdDate: "2026-05-19T00:00:00Z" },
      },
      // No address → empty location string, not undefined.
      { organizationId: "org-2", organizationName: "No Orders Inc", location: "", lastOrder: undefined },
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
