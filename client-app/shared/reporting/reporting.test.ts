import { describe, expect, it } from "vitest";
import {
  buildReportingMonths,
  buildReportingPlan,
  buildReportingVariables,
  isSameWindows,
  toReportingMonths,
  changeDirection,
  isReportingPeriod,
  lastYearBaseline,
  percentChange,
  previousMonthWindow,
  summarizeReporting,
  toReportingData,
  toReportingMonth,
  withMonthChanges,
  REPORTING_PERIODS,
} from "./reporting";
import type { ReportingMonthSlotType } from "./reporting";

// Local-time constructors, so the windows read the same in any time zone.
const localIso = (year: number, month: number, day: number, h = 0, min = 0, s = 0, ms = 0): string =>
  new Date(year, month, day, h, min, s, ms).toISOString();

const NOW = new Date(2026, 9, 21, 15, 0, 0); // Oct 21, 2026

function slot(overrides: Partial<ReportingMonthSlotType> = {}): ReportingMonthSlotType {
  return {
    year: 2026,
    month: 8,
    state: "closed",
    from: "",
    to: "",
    lyFrom: "",
    lyTo: "",
    daysPassed: 30,
    daysInMonth: 30,
    ...overrides,
  };
}

describe("buildReportingMonths", () => {
  it("covers January to December of the current year, with the months after today upcoming", () => {
    const months = buildReportingMonths("year", NOW);

    expect(months).toHaveLength(12);
    expect(months.map((month) => month.state)).toEqual([
      ...Array<string>(9).fill("closed"),
      "current",
      "upcoming",
      "upcoming",
    ]);
  });

  it("rolls back across the year boundary for the last 12 months", () => {
    const months = buildReportingMonths("12m", NOW);

    expect(months[0]).toMatchObject({ year: 2025, month: 10 });
    expect(months.at(-1)).toMatchObject({ year: 2026, month: 9, state: "current" });
  });

  it("returns the three months of a quarter", () => {
    expect(buildReportingMonths("q2", NOW).map((month) => month.month)).toEqual([3, 4, 5]);
    expect(buildReportingMonths("q4", NOW).map((month) => month.state)).toEqual(["current", "upcoming", "upcoming"]);
  });

  it("ends the current month at the end of today and compares it with the whole month last year", () => {
    const current = buildReportingMonths("6m", NOW).at(-1);

    expect(current).toMatchObject({
      from: localIso(2026, 9, 1),
      to: localIso(2026, 9, 21, 23, 59, 59, 999),
      lyFrom: localIso(2025, 9, 1),
      lyTo: localIso(2025, 9, 31, 23, 59, 59, 999),
      daysPassed: 21,
      daysInMonth: 31,
    });
  });

  it("ends a closed month on its last day, leap February included", () => {
    const february = buildReportingMonths("q1", new Date(2028, 5, 1))[1];

    expect(february.to).toBe(localIso(2028, 1, 29, 23, 59, 59, 999));
    expect(february.lyTo).toBe(localIso(2027, 1, 28, 23, 59, 59, 999));
  });

  it("never exceeds the query's month slots", () => {
    for (const period of REPORTING_PERIODS) {
      expect(buildReportingMonths(period, NOW).length).toBeLessThanOrEqual(12);
    }
  });
});

describe("toReportingMonth", () => {
  it("derives AOV and the change vs last year from the month's totals", () => {
    const month = toReportingMonth(slot(), {
      totals: { amount: 1000, count: 3 },
      lastYear: { amount: 800, count: 2 },
    });

    expect(month).toMatchObject({ revenue: 1000, orders: 3, lastYearRevenue: 800, lastYearAov: 400 });
    expect(month.aov).toBeCloseTo(333.33, 2);
    expect(month.revenueChange).toBe(25);
  });

  it("leaves AOV and the change empty instead of dividing by zero", () => {
    const month = toReportingMonth(slot(), {
      totals: { amount: 0, count: 0 },
      lastYear: { amount: 0, count: 0 },
    });

    expect(month).toMatchObject({ revenue: 0, orders: 0, aov: null, revenueChange: null, aovChange: null });
  });

  it("projects the current month to its end and compares the projection with last year", () => {
    const month = toReportingMonth(slot({ state: "current", daysPassed: 10, daysInMonth: 30 }), {
      totals: { amount: 1000, count: 5 },
      lastYear: { amount: 2000, count: 10 },
    });

    expect(month).toMatchObject({ projectedRevenue: 3000, revenueChange: 50 });
  });

  it("reports nothing for an upcoming month", () => {
    const month = toReportingMonth(slot({ state: "upcoming" }), { totals: { amount: 10, count: 1 } });

    expect(month).toMatchObject({ revenue: null, orders: null, aov: null, projectedRevenue: null });
  });
});

describe("summarizeReporting", () => {
  it("averages closed months only and divides period revenue by period orders", () => {
    const months = [
      toReportingMonth(slot(), { totals: { amount: 1000, count: 2 } }),
      toReportingMonth(slot(), { totals: { amount: 3000, count: 2 } }),
      toReportingMonth(slot({ state: "current", daysPassed: 1, daysInMonth: 30 }), {
        totals: { amount: 600, count: 1 },
      }),
      toReportingMonth(slot({ state: "upcoming" }), {}),
    ];

    expect(summarizeReporting(months)).toMatchObject({
      averageRevenuePerClosedMonth: 2000,
      periodAov: 920,
      revenue: 4600,
      orders: 5,
    });
  });

  it("returns empty figures without closed months or orders", () => {
    expect(summarizeReporting([toReportingMonth(slot({ state: "upcoming" }), {})])).toMatchObject({
      averageRevenuePerClosedMonth: null,
      periodAov: null,
      revenueChange: null,
      currentMonth: null,
    });
  });
});

describe("percentChange", () => {
  it("returns null without a positive baseline", () => {
    expect(percentChange(10, 0)).toBeNull();
    expect(percentChange(null, 10)).toBeNull();
    expect(percentChange(90, 100)).toBe(-10);
  });
});

describe("previousMonthWindow", () => {
  it("returns the month before January for the current year", () => {
    expect(previousMonthWindow("year", NOW)).toEqual({
      from: localIso(2025, 11, 1),
      to: localIso(2025, 11, 31, 23, 59, 59, 999),
    });
  });

  it("returns the month before a rolling period", () => {
    expect(previousMonthWindow("6m", NOW).from).toBe(localIso(2026, 3, 1));
  });
});

describe("withMonthChanges", () => {
  it("compares each month with the one before, the first with the month before the period", () => {
    const months = withMonthChanges(
      [
        toReportingMonth(slot(), { totals: { amount: 1200, count: 4 } }),
        toReportingMonth(slot(), { totals: { amount: 900, count: 2 } }),
      ],
      { amount: 1000, count: 4 },
    );

    expect(months.map((month) => month.revenueMonthChange)).toEqual([20, -25]);
    expect(months.map((month) => month.aovMonthChange)).toEqual([20, 50]);
  });

  it("compares the current month's projection and stops at upcoming months", () => {
    const months = withMonthChanges([
      toReportingMonth(slot(), { totals: { amount: 1000, count: 2 } }),
      toReportingMonth(slot({ state: "current", daysPassed: 15, daysInMonth: 30 }), {
        totals: { amount: 600, count: 1 },
      }),
      toReportingMonth(slot({ state: "upcoming" }), {}),
    ]);

    expect(months.map((month) => month.revenueMonthChange)).toEqual([null, 20, null]);
  });
});

describe("summarizeReporting vs last year", () => {
  it("prorates the current month of last year to the same day before comparing", () => {
    const summary = summarizeReporting([
      toReportingMonth(slot(), { totals: { amount: 1100, count: 2 }, lastYear: { amount: 1000, count: 2 } }),
      toReportingMonth(slot({ state: "current", daysPassed: 15, daysInMonth: 30 }), {
        totals: { amount: 600, count: 2 },
        lastYear: { amount: 1000, count: 4 },
      }),
    ]);

    // Last year: 1000 + 1000 × 15/30 = 1500 revenue, 2 + 4 × 15/30 = 4 orders.
    expect(summary.revenueChange).toBeCloseTo(13.33, 2);
    expect(summary.ordersChange).toBe(0);
    expect(summary.aovChange).toBeCloseTo(13.33, 2);
    expect(summary.currentMonth).toMatchObject({ revenue: 600, projectedRevenue: 1200, daysPassed: 15 });
  });

  it("prorates by last year's month length, so a leap February compares like with like", () => {
    const summary = summarizeReporting([
      toReportingMonth(slot({ year: 2028, month: 1, state: "current", daysPassed: 14, daysInMonth: 29 }), {
        totals: { amount: 1400, count: 7 },
        lastYear: { amount: 2800, count: 14 },
      }),
    ]);

    // February 2027 has 28 days: day 14 is half of it.
    expect(summary.revenueChange).toBe(0);
    expect(summary.ordersChange).toBe(0);
  });

  it("takes the whole of last year's month on its last day, even when this month runs longer", () => {
    const summary = summarizeReporting([
      toReportingMonth(slot({ year: 2028, month: 1, state: "current", daysPassed: 29, daysInMonth: 29 }), {
        totals: { amount: 2800, count: 14 },
        lastYear: { amount: 2800, count: 14 },
      }),
    ]);

    expect(summary.revenueChange).toBe(0);
  });

  it("has no change without any last-year data", () => {
    const summary = summarizeReporting([toReportingMonth(slot(), { totals: { amount: 100, count: 1 } })]);

    expect(summary).toMatchObject({ revenueChange: null, ordersChange: null, aovChange: null });
  });
});

describe("isReportingPeriod", () => {
  it("accepts the offered periods only", () => {
    expect(REPORTING_PERIODS.every(isReportingPeriod)).toBe(true);
    expect(isReportingPeriod("")).toBe(false);
    expect(isReportingPeriod("q5")).toBe(false);
    expect(isReportingPeriod(["year"])).toBe(false);
  });
});

describe("changeDirection", () => {
  it("follows the printed one-decimal figure, so a change that reads 0.0% is flat", () => {
    expect(changeDirection(0)).toBe("flat");
    expect(changeDirection(0.04)).toBe("flat");
    expect(changeDirection(-0.04)).toBe("flat");
    expect(changeDirection(0.05)).toBe("up");
    expect(changeDirection(-0.05)).toBe("down");
    expect(changeDirection(12.3)).toBe("up");
  });
});

describe("lastYearBaseline", () => {
  it("has no baseline for a month without sales last year", () => {
    const month = toReportingMonth(slot(), { totals: { amount: 100, count: 1 }, lastYear: { amount: 0, count: 0 } });

    expect(lastYearBaseline(month, "sales")).toBeNull();
    expect(lastYearBaseline(month, "aov")).toBeNull();
  });

  it("returns last year's figure when there is one, whatever this month did", () => {
    const month = toReportingMonth(slot(), { totals: { amount: 0, count: 0 }, lastYear: { amount: 900, count: 3 } });

    expect(lastYearBaseline(month, "sales")).toBe(900);
    expect(lastYearBaseline(month, "aov")).toBe(300);
  });
});

describe("buildReportingPlan", () => {
  it("pairs a period's months with the month before them", () => {
    const plan = buildReportingPlan("q2", NOW);

    expect(plan.period).toBe("q2");
    expect(plan.months.map((month) => month.month)).toEqual([3, 4, 5]);
    expect(plan.previous).toEqual(previousMonthWindow("q2", NOW));
  });
});

describe("isSameWindows", () => {
  it("matches two periods over the same months", () => {
    const december = new Date(2026, 11, 10);

    expect(isSameWindows(buildReportingPlan("12m", december), buildReportingPlan("year", december))).toBe(true);
  });

  it("tells periods over different months apart", () => {
    expect(isSameWindows(buildReportingPlan("q1", NOW), buildReportingPlan("q2", NOW))).toBe(false);
    expect(isSameWindows(buildReportingPlan("6m", NOW), buildReportingPlan("12m", NOW))).toBe(false);
  });
});

describe("toReportingMonths", () => {
  it("reads each slot's figures against its own month and chains the month-over-month changes", () => {
    const plan = buildReportingPlan("q1", NOW);
    const months = toReportingMonths({
      plan,
      months: [{ totals: { amount: 100, count: 1 } }, undefined, { totals: { amount: 300, count: 3 } }],
      previous: { amount: 50, count: 1 },
    });

    expect(months.map((month) => month.revenue)).toEqual([100, null, 300]);
    expect(months[0].revenueMonthChange).toBe(100);
    // A month without figures has no orders and breaks the chain.
    expect(months[2].revenueMonthChange).toBeNull();
  });
});

describe("buildReportingVariables", () => {
  it("asks for the period's started months and leaves the other slots out", () => {
    const plan = buildReportingPlan("q4", NOW); // Oct is current, Nov and Dec are to come
    const variables = buildReportingVariables(plan);

    expect(variables).toMatchObject({
      prevFrom: plan.previous.from,
      prevTo: plan.previous.to,
      use0: true,
      from0: plan.months[0].from,
      to0: plan.months[0].to,
      lyFrom0: plan.months[0].lyFrom,
      lyTo0: plan.months[0].lyTo,
      use1: false,
      use2: false,
      use3: false,
      use11: false,
    });
    expect(variables.from3).toBeUndefined();
  });
});

describe("toReportingData", () => {
  it("reads each slot alias into its month of the plan", () => {
    const plan = buildReportingPlan("q1", NOW);
    const data = toReportingData(plan, {
      currencyCode: "EUR",
      m0: { total: { amount: 100 }, count: 1 },
      ly0: { total: { amount: 80 }, count: 2 },
      m1: null,
      m2: { total: { amount: 300 }, count: 3 },
      prev: { total: { amount: 50 }, count: 1 },
    });

    expect(data).toEqual({
      plan,
      months: [
        { totals: { amount: 100, count: 1 }, lastYear: { amount: 80, count: 2 } },
        { totals: undefined, lastYear: undefined },
        { totals: { amount: 300, count: 3 }, lastYear: undefined },
      ],
      previous: { amount: 50, count: 1 },
      currencyCode: "EUR",
    });
  });
});
