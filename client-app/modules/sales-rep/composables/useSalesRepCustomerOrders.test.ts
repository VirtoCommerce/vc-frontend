import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, shallowRef } from "vue";
import { PAGE_SIZE, useSalesRepCustomerOrders } from "./useSalesRepCustomerOrders";
import type { SalesRepOrdersQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<SalesRepOrdersQuery | undefined>(undefined);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const onError = vi.fn();
  const useQuery = vi.fn(() => ({ result, loading, error, onError }));
  return { result, loading, error, onError, useQuery };
});

const customerMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return { loading: ref(false), notFound: ref(false) };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));

vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US", currencyCode: "USD" } }));

vi.mock("./useSalesRepCustomer", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepCustomer: () => ({
      customer: ref({ organizationName: "MERCURY123" }),
      loading: customerMock.loading,
      notFound: customerMock.notFound,
    }),
  };
});

function lastCallArgs(): unknown[] {
  return queryMock.useQuery.mock.calls.at(-1) ?? [];
}

/** The reactive `variables` computed the composable handed to useQuery. */
function passedVariables(): {
  organizationId?: string;
  storeId?: string;
  cultureName?: string;
  first: number;
  after: string;
  keyword: string;
  sort?: string;
  filter?: string;
} {
  const variables = lastCallArgs()[1] as { value: ReturnType<typeof passedVariables> } | undefined;
  if (!variables) {
    throw new Error("useQuery was not called with variables");
  }
  return variables.value;
}

function ordersResult(totalCount: number, items: NonNullable<SalesRepOrdersQuery["salesRepOrders"]>["items"]) {
  return { salesRepOrders: { totalCount, items } };
}

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.loading.value = false;
  queryMock.error.value = null;
  queryMock.useQuery.mockClear();
  customerMock.loading.value = false;
  customerMock.notFound.value = false;
});

describe("useSalesRepCustomerOrders", () => {
  it("queries the customer's orders with offset-as-cursor paging and named sort/filter rules", () => {
    const { page, keyword, sortRule, filter } = useSalesRepCustomerOrders("org-1");

    expect(passedVariables()).toMatchObject({
      organizationId: "org-1",
      // Scoped to the current store so other-store orders don't leak in.
      storeId: "test-store",
      cultureName: "en-US",
      first: PAGE_SIZE,
      after: "0",
      keyword: "",
      sort: undefined,
      filter: undefined,
    });

    page.value = 3;
    expect(passedVariables().after).toBe(String((3 - 1) * PAGE_SIZE));

    keyword.value = "CO260812";
    expect(passedVariables().keyword).toBe("CO260812");

    sortRule.value = "total:asc";
    expect(passedVariables().sort).toBe("total:asc");

    filter.value = "on-hold";
    expect(passedVariables().filter).toBe("on-hold");
  });

  it("requests keepPreviousResult so the table doesn't flash empty between pages", () => {
    useSalesRepCustomerOrders("org-1");

    const options = lastCallArgs()[2] as { keepPreviousResult?: boolean };
    expect(options.keepPreviousResult).toBe(true);
  });

  it("maps SalesRepOrder to the view shape, tolerating missing fields", () => {
    const { orders } = useSalesRepCustomerOrders("org-1");

    queryMock.result.value = ordersResult(2, [
      {
        id: "o-1",
        number: "CO260812-00002",
        organizationId: "org-1",
        organizationName: "MERCURY123",
        createdDate: "2026-05-19T00:00:00Z",
        status: "New",
        statusDisplayValue: "New",
        itemsCount: 3,
        total: { amount: 1200, formattedAmount: "$1,200.00", currency: { code: "USD", symbol: "$" } },
      },
      // number, status and total absent on the wire
      {
        id: "o-2",
        organizationId: "org-1",
        createdDate: "2026-05-18T00:00:00Z",
        itemsCount: 0,
        total: { amount: 0, formattedAmount: "", currency: { code: "USD", symbol: "$" } },
      },
    ]);

    expect(orders.value).toEqual([
      {
        id: "o-1",
        number: "CO260812-00002",
        organizationId: "org-1",
        organizationName: "MERCURY123",
        createdDate: "2026-05-19T00:00:00Z",
        status: "New",
        statusDisplayValue: "New",
        itemsCount: "3",
        total: "$1,200.00",
      },
      // Absent values read as blanks or a currency zero, never as a missing row (VCST-5586).
      {
        id: "o-2",
        number: "",
        organizationId: "org-1",
        organizationName: "",
        createdDate: "2026-05-18T00:00:00Z",
        status: "",
        statusDisplayValue: "",
        itemsCount: "0",
        total: "$0.00",
      },
    ]);
  });

  it("derives pages from totalCount, never below 1", () => {
    const { pages } = useSalesRepCustomerOrders("org-1");

    expect(pages.value).toBe(1); // no result yet

    queryMock.result.value = ordersResult(0, []);
    expect(pages.value).toBe(1);

    queryMock.result.value = ordersResult(PAGE_SIZE * 3 + 4, []);
    expect(pages.value).toBe(4);
  });

  it("clamps the current page when the result set shrinks below it", async () => {
    const { page, pages } = useSalesRepCustomerOrders("org-1");

    queryMock.result.value = ordersResult(PAGE_SIZE * 3, []);
    page.value = 3;
    await nextTick();
    expect(page.value).toBe(3);

    queryMock.result.value = ordersResult(PAGE_SIZE, []);
    await nextTick();
    expect(pages.value).toBe(1);
    expect(page.value).toBe(1);
  });

  it("returns to the first page when the route switches to another customer", async () => {
    const organizationId = shallowRef("org-1");
    const { page } = useSalesRepCustomerOrders(organizationId);

    page.value = 3;
    organizationId.value = "org-2";
    await nextTick();

    expect(page.value).toBe(1);
    expect(passedVariables()).toMatchObject({ organizationId: "org-2", after: "0" });
  });

  it("stays loading until both the customer and the orders have settled", () => {
    const { loading } = useSalesRepCustomerOrders("org-1");

    expect(loading.value).toBe(false);

    customerMock.loading.value = true;
    expect(loading.value).toBe(true);

    customerMock.loading.value = false;
    queryMock.loading.value = true;
    expect(loading.value).toBe(true);
  });

  it("reports a failed read so the page can name it instead of the empty view", () => {
    const { failed } = useSalesRepCustomerOrders("org-1");

    expect(failed.value).toBe(false);

    queryMock.error.value = new Error("denied");
    expect(failed.value).toBe(true);
  });

  it("passes the customer lookup's not-found through", () => {
    const { notFound } = useSalesRepCustomerOrders("org-1");

    expect(notFound.value).toBe(false);

    customerMock.notFound.value = true;
    expect(notFound.value).toBe(true);
  });
});
