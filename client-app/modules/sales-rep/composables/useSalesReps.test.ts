import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { PAGE_SIZE, useSalesReps } from "./useSalesReps";
import type { CustomerSalesRepsQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<CustomerSalesRepsQuery | undefined>(undefined);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const onError = vi.fn();
  const useQuery = vi.fn(() => ({
    result,
    loading,
    error,
    onError,
  }));
  return { result, loading, error, onError, useQuery };
});

/** The args of the most recent useQuery call (the impl is param-less, so read them here). */
function lastCallArgs(): unknown[] {
  return queryMock.useQuery.mock.calls.at(-1) ?? [];
}

vi.mock("@vue/apollo-composable", () => ({
  useQuery: queryMock.useQuery,
}));

vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store" } }));

function repsResult(totalCount: number, items: NonNullable<CustomerSalesRepsQuery["customerSalesReps"]>["items"]) {
  return { customerSalesReps: { totalCount, items } };
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

describe("useSalesReps", () => {
  it("queries server-side with offset-as-cursor paging, applied keyword, and column:direction sort", () => {
    const { page, sort, keyword } = useSalesReps();

    // Scoped to the current store (globals.storeId) so reps from another store don't leak in.
    expect(passedVariables()).toEqual({
      storeId: "test-store",
      first: PAGE_SIZE,
      after: "0",
      keyword: "",
      sort: "name:asc",
    });

    page.value = 3;
    expect(passedVariables().after).toBe(String((3 - 1) * PAGE_SIZE));

    sort.value = { column: "email", direction: "desc" };
    expect(passedVariables().sort).toBe("email:desc");

    // `keyword` is the applied term (the page sets it on enter/click) — it flows straight
    // into the query with no debounce of its own.
    keyword.value = "Alice";
    expect(passedVariables().keyword).toBe("Alice");
  });

  it("requests keepPreviousResult so the table doesn't flash empty between pages", () => {
    useSalesReps();
    const options = lastCallArgs()[2] as { keepPreviousResult?: boolean };
    expect(options.keepPreviousResult).toBe(true);
  });

  it("maps SalesRepContact to the view shape, tolerating missing fields", () => {
    const { items } = useSalesReps();
    queryMock.result.value = repsResult(2, [
      { id: "1", name: "K. Iusupov", fullName: "Kirill Iusupov", emails: ["k@test.com"], phones: ["+1 111"] },
      { id: "2", name: "No Contacts" }, // no fullName/emails/phones — like the live fixture
    ]);

    expect(items.value).toEqual([
      { id: "1", name: "Kirill Iusupov", email: "k@test.com", phone: "+1 111" },
      { id: "2", name: "No Contacts", email: "", phone: "" },
    ]);
  });

  it("derives pages from totalCount, never below 1", () => {
    const { pages } = useSalesReps();

    expect(pages.value).toBe(1); // no result yet

    queryMock.result.value = repsResult(0, []);
    expect(pages.value).toBe(1);

    queryMock.result.value = repsResult(PAGE_SIZE * 2 + 1, []);
    expect(pages.value).toBe(3);
  });

  it("clamps the current page when the result set shrinks below it", async () => {
    const { page, pages } = useSalesReps();

    queryMock.result.value = repsResult(PAGE_SIZE * 3, []); // 3 pages
    page.value = 3;
    await nextTick();
    expect(page.value).toBe(3); // still valid — no clamp

    queryMock.result.value = repsResult(PAGE_SIZE, []); // shrinks to 1 page
    await nextTick();
    expect(pages.value).toBe(1);
    expect(page.value).toBe(1); // clamped back to the last valid page
  });

  it("passes loading through and registers an error handler", () => {
    const { loading } = useSalesReps();

    queryMock.loading.value = true;
    expect(loading.value).toBe(true);

    expect(queryMock.onError).toHaveBeenCalledTimes(1);
  });

  it("surfaces the query error so the page can name the failure", () => {
    const { error } = useSalesReps();

    expect(error.value).toBeNull();

    queryMock.error.value = new Error("boom");
    expect(error.value).toBeInstanceOf(Error);
  });
});
