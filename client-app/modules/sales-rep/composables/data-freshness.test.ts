import { ApolloClient, ApolloLink, Observable } from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { cache } from "@/core/api/graphql/config/cache";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepCustomer } from "./useSalesRepCustomer";
import { useSalesRepCustomerCounts } from "./useSalesRepCustomerCounts";
import { useSalesRepCustomers } from "./useSalesRepCustomers";
import { useSalesRepCustomersCount } from "./useSalesRepCustomersCount";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import { useSalesRepOrders } from "./useSalesRepOrders";
import { useSalesRepTopSellers } from "./useSalesRepTopSellers";

vi.mock("@/core/globals", () => ({
  globals: { storeId: "test-store", currencyCode: "USD", cultureName: "en-US" },
}));

let requestCount = 0;
let metric = 1;

function money(amount: number) {
  return { __typename: "MoneyType", amount, formattedAmount: `$${amount}` };
}

function orderPeriod(count: number) {
  return { __typename: "CustomerOrderStatisticsPeriod", count, total: money(count * 10), average: money(10) };
}

function orderComparison() {
  return {
    __typename: "CustomerOrderStatisticsComparison",
    totalChange: money(1),
    totalChangePercent: 1,
    countChange: 1,
    countChangePercent: 1,
  };
}

// Apollo can't read a partial entry back from the cache, so every alias a document selects is answered.
function orderStatistics() {
  return {
    salesRepCustomerOrderStatistics: {
      __typename: "CustomerOrderStatistics",
      currencyCode: "USD",
      mtd: orderPeriod(metric),
      ytd: orderPeriod(metric),
      week: orderPeriod(metric),
      newOrders: orderPeriod(metric),
      newOrdersToday: orderPeriod(metric),
      weekVsPrevWeek: orderComparison(),
      mtdVsPrevMonth: orderComparison(),
      ytdVsLastYear: orderComparison(),
    },
  };
}

function cartStatistics() {
  return {
    salesRepCustomerCartStatistics: {
      __typename: "CustomerCartStatistics",
      currencyCode: "USD",
      activeCarts: { __typename: "CustomerCartStatisticsPeriod", count: metric, total: money(metric * 10) },
      newCartsThisWeek: { __typename: "CustomerCartStatisticsPeriod", count: metric },
    },
  };
}

function customerCounts() {
  return {
    salesRepCustomerCounts: {
      __typename: "SalesRepCustomerCounts",
      assignedCustomers: metric,
      thisMonth: { __typename: "SalesRepCustomerCountsPeriod", orderingCustomers: metric, newCustomers: metric },
    },
  };
}

function orders() {
  return {
    salesRepOrders: {
      __typename: "SalesRepOrderConnection",
      totalCount: metric,
      items: [
        {
          __typename: "SalesRepOrder",
          id: "order-1",
          number: "SO-1",
          organizationId: "org-a",
          organizationName: "Org A",
          createdDate: "2026-08-03T00:00:00.000Z",
          status: "New",
          statusDisplayValue: "New",
          // The row is a normalized entity, so this is where a stale read would replay the old figure.
          itemsCount: metric,
          total: { ...money(metric * 10), currency: { __typename: "CurrencyType", code: "USD", symbol: "$" } },
        },
      ],
    },
  };
}

function topSellers() {
  return {
    salesRepTopSellers: [
      {
        __typename: "SalesRepTopSeller",
        rank: 1,
        productId: "product-1",
        name: "Product 1",
        sku: "SKU-1",
        imageUrl: "",
        categoryId: "category-1",
        units: metric,
        revenue: { ...money(metric * 10), currency: { __typename: "CurrencyType", code: "USD" } },
      },
    ],
  };
}

function customerDetails() {
  return {
    salesRepCustomer: {
      __typename: "SalesRepCustomerDetails",
      organizationId: "org-a",
      organizationName: "Org A",
      iconUrl: "",
      accountType: "Garden Center",
      // The details type selects no numeric field, so the phone carries the metric.
      phone: String(metric),
      address: { __typename: "SalesRepAddress", city: "Berlin", regionName: "Berlin" },
      primaryContact: { __typename: "SalesRepContact", id: "contact-1", fullName: "Ann Lee", name: "ann" },
    },
  };
}

function customerRow() {
  return {
    __typename: "SalesRepCustomer",
    organizationId: "org-a",
    organizationName: "Org A",
    accountType: "Garden Center",
    address: { __typename: "SalesRepAddress", postalCode: "10115", zip: "", city: "Berlin", regionName: "Berlin" },
    ytd: { __typename: "CustomerOrderStatisticsPeriod", total: money(metric * 10), count: metric },
    lastYear: { __typename: "CustomerOrderStatisticsPeriod", total: money(metric * 10), count: metric },
    lastOrder: { __typename: "SalesRepOrder", id: "order-1", number: "SO-1", createdDate: "2026-08-03T00:00:00.000Z" },
  };
}

function customers() {
  return {
    salesRepCustomers: { __typename: "SalesRepCustomerConnection", totalCount: metric, items: [customerRow()] },
  };
}

function customersCount() {
  return { salesRepCustomers: { __typename: "SalesRepCustomerConnection", totalCount: metric } };
}

const responses: Record<string, () => Record<string, unknown>> = {
  SalesRepCustomerOrderStatistics: orderStatistics,
  SalesRepCustomerCartStatistics: cartStatistics,
  SalesRepCustomerCounts: customerCounts,
  SalesRepOrders: orders,
  SalesRepTopSellers: topSellers,
  SalesRepCustomer: customerDetails,
  SalesRepCustomers: customers,
  SalesRepCustomersCount: customersCount,
};

const link = new ApolloLink(
  (operation) =>
    new Observable((observer) => {
      const buildResponse = responses[operation.operationName];
      if (!buildResponse) {
        throw new Error(`Unexpected operation: ${operation.operationName}`);
      }

      requestCount += 1;
      observer.next({ data: buildResponse() });
      observer.complete();
    }),
);

function mountWidget<T>(use: () => T): { stop: () => void; api: T } {
  const scope = effectScope();
  const api = scope.run(use)!;
  return { stop: () => scope.stop(), api };
}

async function waitFor(condition: () => boolean, description: string): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (condition()) {
      return;
    }
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve));
  }

  throw new Error(`Timed out waiting for ${description}`);
}

beforeEach(async () => {
  requestCount = 0;
  metric = 1;
  await cache.reset({ discardWatches: true });
  provideApolloClient(new ApolloClient({ link, cache }));
});

// Every hub read, each paired with a probe on the field carrying `metric`. Waiting on the probe rather
// than on "a request fired" is what makes these fail under cache-first: hub variables are day-stable, so
// a remount sends an identical request and would otherwise replay the session's first figure forever.
const widgetSources: [string, () => () => number | undefined][] = [
  [
    "order statistics",
    () => {
      const { statistics } = useSalesRepOrderStatistics();
      return () => statistics.value?.newOrders?.count;
    },
  ],
  [
    "cart statistics",
    () => {
      const { statistics } = useSalesRepCartStatistics();
      return () => statistics.value?.activeCarts?.count;
    },
  ],
  [
    "customer counts",
    () => {
      const { counts } = useSalesRepCustomerCounts();
      return () => counts.value?.assignedCustomers;
    },
  ],
  [
    "orders list",
    () => {
      const { orders: rows } = useSalesRepOrders();
      return () => rows.value[0]?.itemsCount;
    },
  ],
  [
    "top sellers",
    () => {
      const { items } = useSalesRepTopSellers();
      return () => items.value[0]?.units;
    },
  ],
  [
    "customer profile header",
    () => {
      const { customer } = useSalesRepCustomer("org-a");
      return () => (customer.value ? Number(customer.value.phone) : undefined);
    },
  ],
  [
    "my customers list",
    () => {
      const { items } = useSalesRepCustomers();
      return () => items.value[0]?.ytdCount;
    },
  ],
  [
    "customers count badge",
    () => {
      const { count } = useSalesRepCustomersCount();
      // The composable floors a missing count to 0; only a painted figure should settle the probe.
      return () => count.value || undefined;
    },
  ],
];

describe.each(widgetSources)("%s", (_name, use) => {
  it("serves the updated figure when it mounts again, without a page reload", async () => {
    const first = mountWidget(use);
    await waitFor(() => first.api() === 1, "the first mount to paint");
    expect(requestCount).toBe(1);
    first.stop();

    metric = 5;
    const second = mountWidget(use);
    await waitFor(() => second.api() === 5, "the remount to serve the updated figure");

    expect(requestCount).toBe(2);
    second.stop();
  });
});

/** Cached root-field entries for the order statistics op — one per distinct argument set. */
function cachedStatisticsEntries(): string[] {
  const rootQuery = (cache.extract().ROOT_QUERY ?? {}) as Record<string, unknown>;
  return Object.keys(rootQuery).filter((key) => key.startsWith("salesRepCustomerOrderStatistics"));
}

describe("customer-scoped statistics", () => {
  // A keyArgs or keyFields policy that collapsed both customers into one entry would bleed one
  // customer's figures into another's card.
  it("keys the cache per customer rather than collapsing both into one entry", async () => {
    const organizationId = ref("org-a");
    const widget = mountWidget(() => useSalesRepOrderStatistics({ organizationId }));
    await waitFor(() => widget.api.statistics.value != null, "org-a's figures");

    metric = 5;
    organizationId.value = "org-b";
    await waitFor(() => requestCount === 2 && !widget.api.loading.value, "org-b's fetch to settle");

    const entries = cachedStatisticsEntries();
    expect(entries.filter((key) => key.includes("org-a"))).toHaveLength(1);
    expect(entries.filter((key) => key.includes("org-b"))).toHaveLength(1);
    expect(widget.api.statistics.value?.newOrders?.count).toBe(5);
    widget.stop();
  });
});
