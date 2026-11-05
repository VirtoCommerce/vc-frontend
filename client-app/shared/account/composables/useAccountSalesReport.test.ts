import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { buildReportingPlan } from "@/shared/reporting";
import { excludedOrdersCount, useAccountSalesReport } from "./useAccountSalesReport";
import type { SalesReportScopeType } from "./useAccountSalesReport";
import type { GetMonthlyOrderStatisticsQuery } from "@/core/api/graphql/types";
import type { ReportingPeriodType } from "@/shared/reporting";
import type { MaybeRefOrGetter, Ref } from "vue";

type StatisticsType = NonNullable<GetMonthlyOrderStatisticsQuery["orderStatistics"]>;

type QueryStateType = { result: Ref<unknown>; loading: Ref<boolean>; error: Ref<unknown> };

// Reset per test in beforeEach; refs are created there, after `vue` is importable.
const queries = vi.hoisted(
  () =>
    ({}) as {
      monthly: QueryStateType;
      monthlyVariables?: Ref<Record<string, unknown>>;
      history: QueryStateType;
      historyVariables: unknown[];
    },
);

vi.mock("@/core/api/graphql/orders", () => ({
  useGetMonthlyOrderStatisticsQuery: (variables: Ref<Record<string, unknown>>) => {
    queries.monthlyVariables = variables;
    return { ...queries.monthly, onError: vi.fn() };
  },
  useGetOrderStatisticsHistoryQuery: (variables: Ref<unknown>) => {
    queries.historyVariables.push(variables.value);
    return { ...queries.history, onError: vi.fn() };
  },
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", currencyCode: "USD", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn() } }));

// Mid-May: two closed months of Q2's view, April and the current May, June still to come.
const NOW = new Date(2026, 4, 15, 12);

const slot = (amount: number, count: number, excludedCount = 0) => ({ count, total: { amount }, excludedCount });

function statistics(overrides: Partial<StatisticsType> = {}): StatisticsType {
  return {
    currencyCode: "USD",
    prev: slot(100, 1),
    ...overrides,
  };
}

const history = (count: number, excludedCount = 0) => ({ orderStatistics: { all: { count, excludedCount } } });

beforeEach(() => {
  queries.monthly = { result: ref(undefined), loading: ref(false), error: ref(null) };
  queries.history = { result: ref(undefined), loading: ref(false), error: ref(null) };
  queries.monthlyVariables = undefined;
  queries.historyVariables = [];
});

describe("excludedOrdersCount", () => {
  it("adds up the orders left out of the period's months", () => {
    const plan = buildReportingPlan("q2", NOW);

    expect(excludedOrdersCount(plan, statistics({ m0: slot(1, 1, 2), m1: slot(1, 1, 3) }))).toBe(5);
    expect(excludedOrdersCount(plan, statistics())).toBe(0);
  });
});

describe("useAccountSalesReport", () => {
  function run(
    period: MaybeRefOrGetter<ReportingPeriodType> = "year",
    reportScope?: MaybeRefOrGetter<SalesReportScopeType | undefined>,
  ) {
    const scope = effectScope();
    const report = scope.run(() => useAccountSalesReport(period, reportScope));
    if (!report) {
      throw new Error("the scope did not run");
    }
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

    queries.history.result.value = history(0);
    await flushPromises();
    expect(report.hasOrders.value).toBe(false);

    queries.history.result.value = history(0, 1);
    await flushPromises();
    expect(report.hasOrders.value).toBe(true);
  });

  // The history has no date window, so it stays one request for the page's life whatever period is picked.
  it("asks for the history with the store context only", () => {
    run();

    expect(queries.historyVariables).toEqual([{ storeId: "B2B-store", currencyCode: "USD", cultureName: "en-US" }]);
  });

  it("keeps the report on when the history cannot be read", () => {
    queries.history.error.value = new Error("down");

    const report = run();

    expect(report.hasOrders.value).toBeUndefined();
    expect(report.failed.value).toBe(false);
  });

  it("hands the report the figures with the plan they were asked for", async () => {
    const report = run();

    queries.monthly.result.value = { orderStatistics: statistics({ m0: slot(500, 2) }) };
    await flushPromises();

    expect(report.data.value?.plan.period).toBe("year");
    expect(report.data.value?.months[0]).toEqual({ totals: { amount: 500, count: 2 }, lastYear: undefined });
  });

  it("asks for the picked period's month windows in the stat cards' store context", async () => {
    const period = ref<ReportingPeriodType>("year");
    run(period);

    expect(queries.monthlyVariables?.value).toMatchObject({
      storeId: "B2B-store",
      currencyCode: "USD",
      cultureName: "en-US",
    });
    // The dashboard counts the user's own orders: no scope is sent.
    expect(queries.monthlyVariables?.value.organizationScope).toBeUndefined();
    expect(queries.monthlyVariables?.value.memberId).toBeUndefined();

    period.value = "q2";
    await nextTick();

    const plan = buildReportingPlan("q2", new Date());
    expect(queries.monthlyVariables?.value).toMatchObject({ from0: plan.months[0].from, use3: false });
  });

  it("asks for the organization's orders, or one member's", async () => {
    const reportScope = ref<SalesReportScopeType>({ organization: true });
    run("year", reportScope);

    expect(queries.monthlyVariables?.value).toMatchObject({ organizationScope: true, memberId: undefined });

    reportScope.value = { organization: true, memberId: "contact-1" };
    await nextTick();

    expect(queries.monthlyVariables?.value).toMatchObject({ organizationScope: true, memberId: "contact-1" });
  });

  // A member who never ordered gets zeros: the empty state would also take away the picker that leads back.
  it("asks for the organization's history, never one member's", () => {
    run("year", { organization: true, memberId: "contact-1" });

    expect(queries.historyVariables).toEqual([
      { storeId: "B2B-store", currencyCode: "USD", cultureName: "en-US", organizationScope: true, memberId: undefined },
    ]);
  });

  // The month slots are positional, so last period's figures must never be read against the months just picked.
  it("keeps the figures with the period they were asked for until the new period's figures arrive", async () => {
    const period = ref<ReportingPeriodType>("year");
    const report = run(period);

    queries.monthly.result.value = { orderStatistics: statistics({ m0: slot(500, 2) }) };
    await flushPromises();

    period.value = "q2";
    await flushPromises();

    expect(report.data.value?.plan.period).toBe("year");

    queries.monthly.result.value = { orderStatistics: statistics({ m0: slot(80, 1) }) };
    await flushPromises();

    expect(report.data.value?.plan.period).toBe("q2");
    expect(report.data.value?.months[0]?.totals).toEqual({ amount: 80, count: 1 });
  });

  // Separate requests: months that land first must not show a buyer who never ordered charts of zeros.
  it("keeps loading while the history is on its way, even once the months are in", () => {
    queries.monthly.result.value = { orderStatistics: statistics() };
    queries.history.loading.value = true;
    const report = run();

    expect(report.loading.value).toBe(true);

    queries.history.loading.value = false;
    queries.history.result.value = history(0);

    expect(report.loading.value).toBe(false);
    expect(report.hasOrders.value).toBe(false);
  });

  it("stops waiting for the history once it has failed", () => {
    queries.history.loading.value = false;
    queries.history.error.value = new Error("down");

    expect(run().loading.value).toBe(false);
  });

  // A known answer is enough: a background refresh of it does not hold back months already in.
  it("does not wait for a refresh of a history it already knows", () => {
    queries.history.result.value = history(4);
    queries.history.loading.value = true;

    expect(run().loading.value).toBe(false);
  });

  it("reports a failed read", () => {
    queries.monthly.error.value = new Error("down");

    expect(run().failed.value).toBe(true);
  });
});
