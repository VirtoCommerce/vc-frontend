import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, shallowRef } from "vue";
import { PAGE_SIZE, useSalesRepCustomerOrders } from "./useSalesRepCustomerOrders";
import type { SalesRepCustomerOrdersQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<SalesRepCustomerOrdersQuery | undefined>(undefined);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const onError = vi.fn();
  const useQuery = vi.fn(() => ({ result, loading, error, onError }));
  return { result, loading, error, onError, useQuery };
});

const customerMock = await vi.hoisted(async () => {
  const vue = await import("vue");
  // shallowRef: a deep ref would unwrap the captured options' own refs before the test reads them.
  return { loading: vue.ref(false), notFound: vue.ref(false), options: vue.shallowRef<unknown>(undefined) };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));

vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US", currencyCode: "USD" } }));

vi.mock("./useSalesRepCustomer", async () => {
  const { computed, ref, toValue } = await import("vue");
  return {
    // Mirrors the real composable, which reports not-found only while it is enabled.
    useSalesRepCustomer: (_id: unknown, options?: { enabled?: unknown }) => {
      customerMock.options.value = options;
      return {
        customer: ref({ organizationName: "MERCURY123" }),
        loading: customerMock.loading,
        notFound: computed(() => (toValue(options?.enabled) ?? true) && customerMock.notFound.value),
      };
    },
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
  sort?: string;
  filter?: string;
  facet?: string;
} {
  const variables = lastCallArgs()[1] as { value: ReturnType<typeof passedVariables> } | undefined;
  if (!variables) {
    throw new Error("useQuery was not called with variables");
  }
  return variables.value;
}

type ConnectionType = NonNullable<SalesRepCustomerOrdersQuery["salesRepCustomerOrders"]>;

function ordersResult(
  totalCount: number,
  items: ConnectionType["items"],
  term_facets: ConnectionType["term_facets"] = [],
) {
  return { salesRepCustomerOrders: { totalCount, items, term_facets } };
}

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.loading.value = false;
  queryMock.error.value = null;
  queryMock.useQuery.mockClear();
  customerMock.loading.value = false;
  customerMock.notFound.value = false;
  customerMock.options.value = undefined;
});

describe("useSalesRepCustomerOrders", () => {
  it("queries one customer's orders with offset-as-cursor paging and the status facet", () => {
    const { page } = useSalesRepCustomerOrders("org-1");

    expect(passedVariables()).toMatchObject({
      organizationId: "org-1",
      // Scoped to the current store so other-store orders don't leak in.
      storeId: "test-store",
      cultureName: "en-US",
      first: PAGE_SIZE,
      after: "0",
      filter: "",
      // The status options and their counts come back with the page itself.
      facet: "status",
      sort: undefined,
    });

    page.value = 3;
    expect(passedVariables().after).toBe(String((3 - 1) * PAGE_SIZE));
  });

  it("folds the keyword, the selected statuses and the date range into one search phrase", () => {
    const { keyword, filters } = useSalesRepCustomerOrders("org-1");

    keyword.value = "CO260812";
    expect(passedVariables().filter).toBe("CO260812");

    // Several statuses narrow to their union — the panel is a multi-select.
    filters.value = { statuses: ["New", "Completed"], startDate: undefined, endDate: undefined };
    expect(passedVariables().filter).toBe('CO260812 status:"New","Completed"');

    filters.value = { statuses: [], startDate: "2026-05-01", endDate: "2026-05-31" };
    expect(passedVariables().filter).toContain("createddate:[");
  });

  // Not the shared helper's own customerNames, which means the buyer who placed the order.
  it("narrows by owning organization, not by the buyer who placed the order", () => {
    const { filters } = useSalesRepCustomerOrders();

    filters.value = { statuses: [], customerNames: ["ACME", "Umbrella"], startDate: undefined, endDate: undefined };

    expect(passedVariables().filter).toBe('organizationname:"ACME","Umbrella"');
    expect(passedVariables().filter).not.toContain("customername:");
  });

  it("always sends a direction, since a bare field name would sort ascending", () => {
    const { sortRule } = useSalesRepCustomerOrders("org-1");

    sortRule.value = "total";
    expect(passedVariables().sort).toBe("total:desc");

    sortRule.value = "total:asc";
    expect(passedVariables().sort).toBe("total:asc");
  });

  it("lists every served customer's orders when no organization is given", () => {
    const { hasCustomer, notFound } = useSalesRepCustomerOrders();

    expect(passedVariables().organizationId).toBeUndefined();
    expect(hasCustomer.value).toBe(false);
    // Spanning customers, so it also aggregates which customer each order belongs to.
    expect(passedVariables().facet).toBe("status organizationname");

    // No customer in scope, so the customer lookup is off and its not-found view never shows.
    const options = customerMock.options.value as { enabled: { value: boolean } };
    expect(options.enabled.value).toBe(false);
    customerMock.notFound.value = true;
    expect(notFound.value).toBe(false);
  });

  it("requests keepPreviousResult so the table doesn't flash empty between pages", () => {
    useSalesRepCustomerOrders("org-1");

    const options = lastCallArgs()[2] as { keepPreviousResult?: boolean };
    expect(options.keepPreviousResult).toBe(true);
  });

  it("maps the order connection to the view shape, tolerating missing fields", () => {
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
        total: { amount: 1200, formattedAmount: "$1,200.00", currency: { code: "USD", symbol: "$" } },
      },
      // number, organizationName and status absent on the wire
      {
        id: "o-2",
        number: "",
        organizationId: "org-1",
        createdDate: "2026-05-18T00:00:00Z",
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
        total: "$0.00",
      },
    ]);
  });

  it("keeps each facet's options apart, with their counts", () => {
    const { statusOptions, customerOptions } = useSalesRepCustomerOrders();

    queryMock.result.value = ordersResult(
      3,
      [],
      [
        {
          name: "status",
          terms: [
            { term: "New", label: "New", count: 1, isSelected: false },
            { term: "Completed", label: "Completed", count: 2, isSelected: false },
          ],
        },
        {
          name: "organizationname",
          terms: [{ term: "ACME", label: "ACME", count: 3, isSelected: false }],
        },
      ],
    );

    expect(statusOptions.value).toEqual([
      { name: "New", label: "New", count: 1 },
      { name: "Completed", label: "Completed", count: 2 },
    ]);
    expect(customerOptions.value).toEqual([{ name: "ACME", label: "ACME", count: 3 }]);
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
