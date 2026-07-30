import { beforeEach, describe, expect, it, vi } from "vitest";
import { ORDERS_DEFAULT_LIMIT } from "../constants";
import { useSalesRepOrders } from "./useSalesRepOrders";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<
    | {
        salesRepOrders?: {
          totalCount?: number;
          items?: Array<Record<string, unknown> | null> | null;
        } | null;
      }
    | undefined
  >(undefined);
  const loading = ref(false);
  const onError = vi.fn();
  const useQuery = vi.fn(() => ({ result, loading, onError }));
  return { result, loading, onError, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US" } }));

/** The reactive `variables` computed the composable handed to useQuery. */
function passedVariables(): {
  organizationId?: string;
  storeId?: string;
  cultureName?: string;
  first: number;
  sort?: string;
  filter?: string;
  periodFrom?: string;
  periodTo?: string;
} {
  const call = (queryMock.useQuery.mock.calls.at(-1) ?? []) as unknown[];
  const variables = call[1] as { value: ReturnType<typeof passedVariables> } | undefined;
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

describe("useSalesRepOrders", () => {
  it("scopes to one customer and store; sort/filter/period default to undefined (server default: recent)", () => {
    useSalesRepOrders({ organizationId: "cust-1" });

    expect(passedVariables()).toEqual({
      organizationId: "cust-1",
      storeId: "test-store",
      cultureName: "en-US",
      first: ORDERS_DEFAULT_LIMIT,
      sort: undefined,
      filter: undefined,
      periodFrom: undefined,
      periodTo: undefined,
    });
  });

  it("omits organizationId for cross-customer use and honors a custom page size", () => {
    useSalesRepOrders({ first: 3 });

    expect(passedVariables()).toEqual({
      organizationId: undefined,
      storeId: "test-store",
      cultureName: "en-US",
      first: 3,
      sort: undefined,
      filter: undefined,
      periodFrom: undefined,
      periodTo: undefined,
    });
  });

  it("passes the named filter, sort rule and created-date window through to the query", () => {
    useSalesRepOrders({
      organizationId: "cust-1",
      filter: "New",
      sort: "recent",
      periodFrom: "2026-01-01T00:00:00.000Z",
      periodTo: "2026-02-01T00:00:00.000Z",
    });

    expect(passedVariables()).toMatchObject({
      filter: "New",
      sort: "recent",
      periodFrom: "2026-01-01T00:00:00.000Z",
      periodTo: "2026-02-01T00:00:00.000Z",
    });
  });

  it("maps orders to the view shape, tolerating missing fields and null items", () => {
    const { orders } = useSalesRepOrders({ organizationId: "cust-1" });

    queryMock.result.value = {
      salesRepOrders: {
        totalCount: 2,
        items: [
          {
            id: "o1",
            number: "1001",
            organizationId: "cust-1",
            organizationName: "Acme Corp",
            createdDate: "2026-07-10T00:00:00Z",
            status: "Completed",
            statusDisplayValue: "Completed",
            itemsCount: 3,
            total: { amount: 120.5, formattedAmount: "$120.50", currency: { code: "USD", symbol: "$" } },
          },
          null,
          {
            id: "o2",
            createdDate: "2026-07-09T00:00:00Z",
            itemsCount: 1,
            total: { amount: 10, formattedAmount: "$10.00", currency: { code: "USD", symbol: "$" } },
          },
        ],
      },
    };

    // `total` keeps the backend-formatted MoneyType.formattedAmount; `itemsCount` goes through the
    // shared stat formatter so it groups like the figures in the widgets above (VCST-5586).
    expect(orders.value).toEqual([
      {
        id: "o1",
        number: "1001",
        organizationId: "cust-1",
        organizationName: "Acme Corp",
        createdDate: "2026-07-10T00:00:00Z",
        status: "Completed",
        statusDisplayValue: "Completed",
        itemsCount: "3",
        total: "$120.50",
      },
      {
        id: "o2",
        number: "",
        organizationId: "",
        organizationName: "",
        createdDate: "2026-07-09T00:00:00Z",
        status: "",
        statusDisplayValue: "",
        itemsCount: "1",
        total: "$10.00",
      },
    ]);
  });

  it("passes loading through and registers an error handler", () => {
    const { loading } = useSalesRepOrders({ organizationId: "cust-1" });

    queryMock.loading.value = true;
    expect(loading.value).toBe(true);

    expect(queryMock.onError).toHaveBeenCalledTimes(1);
  });
});
