import { describe, expect, it } from "vitest";
import { computed, nextTick, ref } from "vue";
import { buildReportingPlan } from "../reporting";
import { useReportingData } from "./useReportingData";
import type { ReportingPeriodType } from "../reporting";

const NOW = new Date(2026, 9, 21);

// Shaped as a generated query type, so a real response stays assignable to what the helper reads.
type SlotType = { __typename?: "Stats"; count: number; excludedCount: number; total: { amount: number } };
type StatisticsType = { __typename?: "Report"; currencyCode: string; m0?: SlotType | null; prev?: SlotType | null };

function statistics(amount: number): StatisticsType {
  return { currencyCode: "USD", m0: { total: { amount }, count: 1, excludedCount: 0 } };
}

function setup(initial?: StatisticsType) {
  const period = ref<ReportingPeriodType>("year");
  const plan = computed(() => buildReportingPlan(period.value, NOW));
  const result = ref<StatisticsType | undefined>(initial);
  return { period, plan, result, ...useReportingData(plan, result) };
}

describe("useReportingData", () => {
  it("has no figures until a response arrives", () => {
    const { data } = setup();

    expect(data.value).toBeUndefined();
  });

  it("reads a response against the plan it was fetched for", () => {
    const { data, plan } = setup(statistics(100));

    expect(data.value?.plan).toBe(plan.value);
    expect(data.value?.months[0]?.totals).toEqual({ amount: 100, count: 1 });
  });

  it("keeps the previous response with its own plan while a newly picked period loads", async () => {
    const { data, period, result } = setup(statistics(100));

    period.value = "q2";
    await nextTick();

    expect(data.value?.plan.period).toBe("year");

    result.value = statistics(200);
    await nextTick();

    expect(data.value?.plan.period).toBe("q2");
    expect(data.value?.months[0]?.totals).toEqual({ amount: 200, count: 1 });
  });

  it("drops the figures when the response goes away", async () => {
    const { data, result } = setup(statistics(100));

    result.value = undefined;
    await nextTick();

    expect(data.value).toBeUndefined();
  });

  it("hands the response with its plan to the caller", () => {
    const { settled, plan, result } = setup(statistics(100));

    expect(settled.value).toEqual({ plan: plan.value, statistics: result.value });
  });
});
