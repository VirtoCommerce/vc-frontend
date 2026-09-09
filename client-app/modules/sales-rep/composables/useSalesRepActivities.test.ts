import { describe, expect, it, vi } from "vitest";
import { useSalesRepActivities } from "./useSalesRepActivities";
import type { SalesRepActivitiesQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  const result = ref<SalesRepActivitiesQuery | undefined>(undefined);
  const loading = ref(false);
  const onError = vi.fn();
  const error = ref<Error | null>(null);
  const useQuery = vi.fn(() => ({ result, loading, error, onError }));
  return { result, loading, error, onError, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({ useQuery: queryMock.useQuery }));
vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US", currencyCode: "USD" } }));

// Typed against the generated row so a fixture can't drift from the real payload shape.
type ActivityEventType = NonNullable<SalesRepActivitiesQuery["salesRepActivities"]>["items"][number];

function activityEvent(overrides: Partial<ActivityEventType> = {}): ActivityEventType {
  return {
    category: "orders",
    type: "orderPlaced",
    occurredAt: "2026-08-20T10:15:00Z",
    precision: "exact",
    count: 1,
    organizationId: "org1",
    organizationName: "Acme",
    orderId: "ord1",
    orderNumber: "CU0001",
    orderStatus: "New",
    orderStatusDisplayValue: "New",
    orderTotal: { amount: 100, formattedAmount: "$100.00" },
    ...overrides,
  };
}

function connection(
  items: ActivityEventType[],
  categoryCounts: { category: string; count: number }[] = [],
): SalesRepActivitiesQuery {
  return { salesRepActivities: { totalCount: items.length, categoryCounts, items } };
}

describe("useSalesRepActivities", () => {
  it("maps an order event with its formatted total and localized status", () => {
    queryMock.result.value = connection([activityEvent()]);

    const { items } = useSalesRepActivities();

    expect(items.value[0]).toMatchObject({
      category: "orders",
      type: "orderPlaced",
      precision: "exact",
      count: 1,
      orderNumber: "CU0001",
      statusDisplayValue: "New",
      orderTotal: "$100.00",
    });
  });

  // GA hour-buckets: the precision flag drives the honest "~" rendering, and a moneyless row must not
  // read as a currency zero.
  it("keeps hour precision and the bucket size, with no money on analytics rows", () => {
    queryMock.result.value = connection([
      activityEvent({
        category: "searches",
        type: "search",
        precision: "hour",
        count: 3,
        searchTerm: "gloves",
        orderId: undefined,
        orderNumber: undefined,
        orderTotal: undefined,
      }),
    ]);

    const { items } = useSalesRepActivities();

    expect(items.value[0]).toMatchObject({ precision: "hour", count: 3, searchTerm: "gloves", orderTotal: "" });
  });

  it("defaults an absent count to 1 so exact rows never render a blank occurrence figure", () => {
    queryMock.result.value = connection([activityEvent({ count: undefined })]);

    const { items } = useSalesRepActivities();

    expect(items.value[0].count).toBe(1);
  });

  it("exposes categoryCounts and totalCount for the tabs", () => {
    queryMock.result.value = {
      salesRepActivities: {
        totalCount: 7,
        categoryCounts: [
          { category: "orders", count: 7 },
          { category: "logins", count: 0 },
        ],
        items: [],
      },
    };

    const { categoryCounts, totalCount } = useSalesRepActivities({ take: 0 });

    expect(totalCount.value).toBe(7);
    expect(categoryCounts.value).toEqual([
      { category: "orders", count: 7 },
      { category: "logins", count: 0 },
    ]);
  });

  // A null field (unauthorized org / analytics off) settles to empty data, never a crash or an error state.
  it("settles to empty data when the whole field is null", () => {
    queryMock.result.value = { salesRepActivities: undefined };

    const { items, categoryCounts, totalCount } = useSalesRepActivities();

    expect(items.value).toEqual([]);
    expect(categoryCounts.value).toEqual([]);
    expect(totalCount.value).toBe(0);
  });

  it("surfaces the query error so the surfaces can show a failure state", () => {
    const { error } = useSalesRepActivities();

    expect(error).toBe(queryMock.error);
  });
});
