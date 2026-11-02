import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { buildReportingPlan } from "@/shared/reporting";
import {
  excludedOrdersCount,
  monthlyOrderStatisticsVariables,
  toSalesReportData,
  useAccountSalesReport,
} from "./useAccountSalesReport";
import type { GetMonthlyOrderStatisticsQuery } from "@/core/api/graphql/types";
import type { Ref } from "vue";

type StatisticsType = NonNullable<GetMonthlyOrderStatisticsQuery["orderStatistics"]>;

// Reset per test in beforeEach; refs are created there, after `vue` is importable.
const query = vi.hoisted(() => ({}) as { result: Ref<unknown>; loading: Ref<boolean>; error: Ref<unknown> });

vi.mock("@/core/api/graphql/orders", () => ({
  useGetMonthlyOrderStatisticsQuery: () => ({
    result: query.result,
    loading: query.loading,
    error: query.error,
    onError: vi.fn(),
  }),
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", currencyCode: "USD", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn() } }));

// Mid-May: two closed months of Q2's view, April and the current May, June still to come.
const NOW = new Date(2026, 4, 15, 12);

const slot = (amount: number, count: number, excludedCount = 0) => ({ count, total: { amount }, excludedCount });

function statistics(overrides: Partial<StatisticsType> = {}): StatisticsType {
  return {
    currencyCode: "USD",
    all: { count: 7, excludedCount: 0 },
    prev: slot(100, 1),
    ...overrides,
  };
}

beforeEach(() => {
  query.result = ref(undefined);
  query.loading = ref(false);
  query.error = ref(null);
});

describe("monthlyOrderStatisticsVariables", () => {
  it("asks for the period's started months with last year beside them, and for nothing past them", () => {
    const plan = buildReportingPlan("q2", NOW);
    const variables = monthlyOrderStatisticsVariables(plan) as Record<string, unknown>;

    expect(variables).toMatchObject({ storeId: "B2B-store", currencyCode: "USD", cultureName: "en-US" });
    expect(variables.prevFrom).toBe(plan.previous.from);
    expect([variables.use0, variables.use1, variables.use2, variables.use3]).toEqual([true, true, false, false]);
    expect(variables.from0).toBe(plan.months[0].from);
    expect(variables.lyTo1).toBe(plan.months[1].lyTo);
    expect(variables.from3).toBeUndefined();
  });
});

describe("toSalesReportData", () => {
  it("reads each month slot and its last-year slot in plan order, with the month before as the baseline", () => {
    const plan = buildReportingPlan("q2", NOW);
    const data = toSalesReportData(plan, statistics({ m0: slot(500, 2), ly0: slot(300, 1), m1: slot(80, 1) }));

    expect(data.plan).toBe(plan);
    expect(data.currencyCode).toBe("USD");
    expect(data.previous).toEqual({ amount: 100, count: 1 });
    expect(data.months).toEqual([
      { totals: { amount: 500, count: 2 }, lastYear: { amount: 300, count: 1 } },
      { totals: { amount: 80, count: 1 }, lastYear: undefined },
      { totals: undefined, lastYear: undefined },
    ]);
  });
});

describe("excludedOrdersCount", () => {
  it("adds up the orders left out of the period's months", () => {
    const plan = buildReportingPlan("q2", NOW);

    expect(excludedOrdersCount(plan, statistics({ m0: slot(1, 1, 2), m1: slot(1, 1, 3) }))).toBe(5);
    expect(excludedOrdersCount(plan, statistics())).toBe(0);
  });
});

describe("useAccountSalesReport", () => {
  function run() {
    const scope = effectScope();
    const report = scope.run(() => useAccountSalesReport("year"))!;
    return report;
  }

  it("knows nothing about the user's orders until the figures arrive", () => {
    const report = run();

    expect(report.data.value).toBeUndefined();
    expect(report.hasOrders.value).toBeUndefined();
    expect(report.excludedCount.value).toBe(0);
  });

  it("tells a user who never ordered from a quiet period, counting orders in other currencies as orders", async () => {
    const report = run();

    query.result.value = {
      orderStatistics: statistics({ all: { count: 0, excludedCount: 0 } }),
    };
    await flushPromises();
    expect(report.hasOrders.value).toBe(false);

    query.result.value = {
      orderStatistics: statistics({ all: { count: 0, excludedCount: 1 } }),
    };
    await flushPromises();
    expect(report.hasOrders.value).toBe(true);
  });

  it("hands the report the figures with the plan they were asked for", async () => {
    const report = run();

    query.result.value = { orderStatistics: statistics({ m0: slot(500, 2) }) };
    await flushPromises();

    expect(report.data.value?.plan.period).toBe("year");
    expect(report.data.value?.months[0]).toEqual({ totals: { amount: 500, count: 2 }, lastYear: undefined });
  });

  it("reports a failed read", () => {
    query.error.value = new Error("down");

    expect(run().failed.value).toBe(true);
  });
});
