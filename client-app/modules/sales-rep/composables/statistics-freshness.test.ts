import { ApolloClient, ApolloLink, Observable } from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { cache } from "@/core/api/graphql/config/cache";
import { useSalesRepCartStatistics } from "./useSalesRepCartStatistics";
import { useSalesRepCustomerCounts } from "./useSalesRepCustomerCounts";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";
import type { Ref } from "vue";

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

const responses: Record<string, () => Record<string, unknown>> = {
  SalesRepCustomerOrderStatistics: orderStatistics,
  SalesRepCustomerCartStatistics: cartStatistics,
  SalesRepCustomerCounts: customerCounts,
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

// Statistics variables are day-stable, so a remount sends identical variables.
const widgetSources: [string, () => { loading: Ref<boolean> }][] = [
  ["order statistics", () => useSalesRepOrderStatistics()],
  ["cart statistics", () => useSalesRepCartStatistics()],
  ["customer counts", () => useSalesRepCustomerCounts()],
];

describe.each(widgetSources)("%s", (_name, use) => {
  it("refetches when the widget mounts again, without a page reload", async () => {
    const first = mountWidget(use);
    await waitFor(() => !first.api.loading.value, "the first mount to settle");
    expect(requestCount).toBe(1);
    first.stop();

    metric = 5;
    const second = mountWidget(use);
    await waitFor(() => !second.api.loading.value, "the remount to settle");

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
