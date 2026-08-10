import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesRepCustomerWidgets } from "./useSalesRepCustomerWidgets";
import { useSalesRepDashboardWidgets } from "./useSalesRepDashboardWidgets";
import type {
  SalesRepCustomerCartStatisticsQuery,
  SalesRepCustomerCountsQuery,
  SalesRepCustomerOrderStatisticsQuery,
} from "../api/graphql/types";
import type { StatWidgetCardType } from "../types/widgets";

type OrderStatsType = SalesRepCustomerOrderStatisticsQuery["salesRepCustomerOrderStatistics"];
type CartStatsType = SalesRepCustomerCartStatisticsQuery["salesRepCustomerCartStatistics"];
type CountsType = SalesRepCustomerCountsQuery["salesRepCustomerCounts"];

// The mappers are what turn a payload into the strings on screen, so drive them directly and mock the
// three query composables beneath them.
const sources = await vi.hoisted(async () => {
  const { ref: r } = await import("vue");
  return {
    orders: r<unknown>(undefined),
    carts: r<unknown>(undefined),
    counts: r<unknown>(undefined),
    ordersError: r<Error | null>(null),
    cartsError: r<Error | null>(null),
    countsError: r<Error | null>(null),
    ordersLoading: r(false),
    cartsLoading: r(false),
    countsLoading: r(false),
  };
});

vi.mock("./useSalesRepOrderStatistics", () => ({
  useSalesRepOrderStatistics: () => ({
    statistics: sources.orders,
    loading: sources.ordersLoading,
    error: sources.ordersError,
  }),
}));
vi.mock("./useSalesRepCartStatistics", () => ({
  useSalesRepCartStatistics: () => ({
    statistics: sources.carts,
    loading: sources.cartsLoading,
    error: sources.cartsError,
  }),
}));
vi.mock("./useSalesRepCustomerCounts", () => ({
  useSalesRepCustomerCounts: () => ({
    counts: sources.counts,
    loading: sources.countsLoading,
    error: sources.countsError,
  }),
}));

vi.mock("@/core/globals", () => ({ globals: { cultureName: "en-US", currencyCode: "USD" } }));

// Real messages, so the assertions are the text a rep actually reads.
vi.mock("vue-i18n", async () => {
  const { createI18n } = await vi.importActual<typeof import("vue-i18n")>("vue-i18n");
  const en = await vi.importActual<typeof import("../locales/en.json")>("../locales/en.json");
  const i18n = createI18n({ locale: "en", legacy: false, messages: { en }, missingWarn: false });
  return { useI18n: () => ({ t: i18n.global.t }) };
});

beforeEach(() => {
  // Reset the data refs too, or a later test silently inherits the previous one's payload.
  sources.orders.value = undefined;
  sources.carts.value = undefined;
  sources.counts.value = undefined;
  sources.ordersError.value = null;
  sources.cartsError.value = null;
  sources.countsError.value = null;
  sources.ordersLoading.value = false;
  sources.cartsLoading.value = false;
  sources.countsLoading.value = false;
});

const money = (amount: number, formattedAmount: string) => ({ amount, formattedAmount });
const zeroMoney = money(0, "$0.00");

/** What the backend returns for a customer with no activity: real periods, all zero. */
function emptyOrders(): OrderStatsType {
  const period = { count: 0, total: zeroMoney, average: zeroMoney };
  return {
    currencyCode: "USD",
    mtd: period,
    ytd: period,
    week: { count: 0, total: zeroMoney },
    newOrders: { count: 0, total: zeroMoney },
    newOrdersToday: { count: 0 },
    // No baseline to compare against, so the backend sends null percents.
    weekVsPrevWeek: { countChange: 0, totalChange: zeroMoney },
    mtdVsPrevMonth: { countChange: 0, totalChange: zeroMoney },
    ytdVsLastYear: { countChange: 0, totalChange: zeroMoney },
  };
}

function allCardText(cards: StatWidgetCardType[]): string[] {
  return cards.flatMap((card) => [card.value, card.sub ?? "", card.delta ?? ""]);
}

/** The renderings VCST-5586 set out to eliminate. `sub`/`delta` may be legitimately absent ("") . */
function expectNoPlaceholders(cards: StatWidgetCardType[]) {
  for (const card of cards) {
    expect(card.value).not.toBe("");
    expect(card.value).not.toBe("—");
    expect(card.value).not.toBe("N/A");
    expect(card.value).not.toContain("null");
    expect(card.value).not.toContain("undefined");
  }

  for (const text of allCardText(cards)) {
    expect(text).not.toBe("—");
    expect(text).not.toContain("N/A");
    expect(text).not.toContain("null");
    expect(text).not.toContain("undefined");
  }
}

describe("stat cards for a customer with no data", () => {
  it("renders every dashboard figure as a zero", () => {
    sources.orders.value = emptyOrders();
    sources.carts.value = {
      currencyCode: "USD",
      activeCarts: { count: 0, total: zeroMoney },
      newCartsThisWeek: { count: 0 },
    } satisfies CartStatsType;
    sources.counts.value = {
      assignedCustomers: 0,
      thisMonth: { orderingCustomers: 0, newCustomers: 0 },
    } satisfies CountsType;

    const { cards } = useSalesRepDashboardWidgets();

    expectNoPlaceholders(cards.value);
    expect(cards.value.map((card) => [card.key, card.value, card.sub, card.delta])).toEqual([
      ["new_orders", "0", "$0.00 total", "0 placed today"],
      ["active_carts", "0", "$0.00", "0 new this week"],
      // No previous-period baseline, so the "vs last X" comparison is absent rather than a false 0%.
      ["orders_placed_week", "0", "$0.00", ""],
      ["orders_placed_mtd", "0", "$0.00", ""],
      ["orders_placed_ytd", "0", "$0.00", ""],
      ["my_customers", "0", "0 ordered this month", "0 new customers"],
    ]);
  });

  it("renders every customer-profile figure as a zero", () => {
    sources.orders.value = emptyOrders();
    sources.carts.value = {
      currencyCode: "USD",
      activeCarts: { count: 0, total: zeroMoney },
      newCartsThisWeek: { count: 0 },
    } satisfies CartStatsType;

    const { cards } = useSalesRepCustomerWidgets("org-1");

    expectNoPlaceholders(cards.value);
    expect(cards.value.map((card) => [card.key, card.value, card.sub, card.delta])).toEqual([
      ["new_orders", "0", "$0.00 total", "0 placed today"],
      ["active_cart", "$0.00", undefined, undefined],
      ["mtd", "$0.00", undefined, "0% of YTD"],
      ["orders_ytd", "0", "$0.00", ""],
      ["aov", "$0.00", "Average per order (YTD)", undefined],
    ]);
  });

  it("still renders zeros when the backend omits the period objects entirely", () => {
    // Periods are nullable in the schema; an absent one must read the same as an empty one.
    sources.orders.value = { currencyCode: "USD" } satisfies OrderStatsType;
    sources.carts.value = { currencyCode: "USD" } satisfies CartStatsType;
    sources.counts.value = { assignedCustomers: 0 } satisfies CountsType;

    const dashboard = useSalesRepDashboardWidgets();
    const profile = useSalesRepCustomerWidgets("org-1");

    expectNoPlaceholders(dashboard.cards.value);
    expectNoPlaceholders(profile.cards.value);
    expect(dashboard.cards.value.map((card) => card.value)).toEqual(["0", "0", "0", "0", "0", "0"]);
    expect(profile.cards.value.map((card) => card.value)).toEqual(["0", "$0.00", "$0.00", "0", "$0.00"]);
  });
});

describe("stat cards for a customer with partial data", () => {
  it("keeps present figures and zeroes only the absent ones", () => {
    sources.orders.value = {
      currencyCode: "USD",
      // Present: YTD has real activity. Absent: mtd/week/newOrders/newOrdersToday.
      ytd: { count: 1234, total: money(56789, "$56,789.00"), average: money(46, "$46.02") },
      ytdVsLastYear: { countChange: 12, countChangePercent: 12.4, totalChange: money(1, "$1.00") },
    } satisfies OrderStatsType;
    sources.carts.value = { currencyCode: "USD" } satisfies CartStatsType;
    sources.counts.value = { assignedCustomers: 4321 } satisfies CountsType;

    const dashboard = useSalesRepDashboardWidgets();
    const profile = useSalesRepCustomerWidgets("org-1");

    expectNoPlaceholders(dashboard.cards.value);
    expectNoPlaceholders(profile.cards.value);

    const byKey = (cards: StatWidgetCardType[], key: string) => cards.find((card) => card.key === key);

    // Present metrics keep the backend string and gain culture grouping on the count.
    expect(byKey(dashboard.cards.value, "orders_placed_ytd")).toMatchObject({
      value: "1,234",
      sub: "$56,789.00",
      delta: "+12% vs last year",
    });
    expect(byKey(dashboard.cards.value, "my_customers")).toMatchObject({ value: "4,321" });
    // Absent metrics read as zeros, not blanks or dashes.
    expect(byKey(dashboard.cards.value, "new_orders")).toMatchObject({
      value: "0",
      sub: "$0.00 total",
      delta: "0 placed today",
    });
    expect(byKey(dashboard.cards.value, "active_carts")).toMatchObject({ value: "0", sub: "$0.00" });

    // The same metric renders identically on the customer page (E2).
    expect(byKey(profile.cards.value, "orders_ytd")).toMatchObject({
      value: "1,234",
      sub: "$56,789.00",
      delta: "+12% vs last year",
    });
    expect(byKey(profile.cards.value, "aov")).toMatchObject({ value: "$46.02" });
    // MTD is absent while YTD is not: the share is 0, not a dropped row.
    expect(byKey(profile.cards.value, "mtd")).toMatchObject({ value: "$0.00", delta: "0% of YTD" });
  });
});

describe("stat cards when one statistics query fails", () => {
  // Every card reads exactly one query, so a single failure must not blank the cards that loaded.
  it("marks only the cards fed by the failed query", () => {
    sources.orders.value = emptyOrders();
    sources.carts.value = {
      currencyCode: "USD",
      activeCarts: { count: 2, total: money(50, "$50.00") },
    } satisfies CartStatsType;
    sources.counts.value = { assignedCustomers: 9 } satisfies CountsType;
    sources.countsError.value = new Error("counts down");

    const { cards } = useSalesRepDashboardWidgets();
    const failedKeys = cards.value.filter((card) => card.failed).map((card) => card.key);

    expect(failedKeys).toEqual(["my_customers"]);
    // The healthy cards still carry their real figures rather than being hidden behind the error.
    expect(cards.value.find((card) => card.key === "active_carts")).toMatchObject({ value: "2", sub: "$50.00" });
  });

  it("marks every card of the failed query on the customer page", () => {
    sources.orders.value = emptyOrders();
    sources.carts.value = {
      currencyCode: "USD",
      activeCarts: { count: 1, total: money(7, "$7.00") },
    } satisfies CartStatsType;
    sources.ordersError.value = new Error("orders down");

    const { cards } = useSalesRepCustomerWidgets("org-1");

    expect(cards.value.filter((card) => card.failed).map((card) => card.key)).toEqual([
      "new_orders",
      "mtd",
      "orders_ytd",
      "aov",
    ]);
    expect(cards.value.find((card) => card.key === "active_cart")).toMatchObject({ failed: false, value: "$7.00" });
  });
});

describe("stat cards while one query is still in flight", () => {
  // <StatWidget> gives loading precedence over the error, so an aggregate loading flag would hold the
  // failed card at the pending placeholder and hide its error until the slowest query settled.
  it("keeps a failed card in its error state while a sibling query is still loading", () => {
    sources.counts.value = undefined;
    sources.countsError.value = new Error("counts down");
    sources.ordersLoading.value = true;

    const { cards } = useSalesRepDashboardWidgets();
    const byKey = (key: string) => cards.value.find((card) => card.key === key);

    expect(byKey("my_customers")).toMatchObject({ loading: false, failed: true });
    // The in-flight query's own cards are the only ones still pending.
    expect(byKey("orders_placed_ytd")).toMatchObject({ loading: true, failed: false });
    expect(byKey("active_carts")).toMatchObject({ loading: false, failed: false });
  });

  it("does not hold every card pending because one query is slow", () => {
    sources.orders.value = emptyOrders();
    sources.carts.value = {
      currencyCode: "USD",
      activeCarts: { count: 0, total: zeroMoney },
    } satisfies CartStatsType;
    sources.countsLoading.value = true;

    const { cards } = useSalesRepDashboardWidgets();

    expect(cards.value.filter((card) => card.loading).map((card) => card.key)).toEqual(["my_customers"]);
  });
});
