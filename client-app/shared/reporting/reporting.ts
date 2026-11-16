import { eod, iso, local } from "./utils";

/** Periods the report offers; `year` is the current calendar year, `q1`–`q4` its quarters. */
export const REPORTING_PERIODS = ["6m", "12m", "year", "q1", "q2", "q3", "q4"] as const;
export type ReportingPeriodType = (typeof REPORTING_PERIODS)[number];
export const REPORTING_DEFAULT_PERIOD: ReportingPeriodType = "year";

export function isReportingPeriod(value: unknown): value is ReportingPeriodType {
  return REPORTING_PERIODS.includes(value as ReportingPeriodType);
}

/** Every percent on the page is printed with this many decimals. */
export const REPORTING_PERCENT_DIGITS = 1;

/** Shown for an amount or a change that has no value (no orders, no baseline), never as $0 or NaN. */
export const REPORTING_NO_VALUE = "—";

// The slot count and the slot index type both come from this list.
const MONTH_SLOT_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
type ReportingSlotIndexType = (typeof MONTH_SLOT_INDEXES)[number];

/** A caller's query carries this many month slots; no period is longer. */
export const REPORTING_MONTH_SLOTS = MONTH_SLOT_INDEXES.length;

const MONTHS_IN_QUARTER = 3;
const ROLLING_MONTHS: Partial<Record<ReportingPeriodType, number>> = { "6m": 6, "12m": 12 };
const QUARTERS: Partial<Record<ReportingPeriodType, number>> = { q1: 0, q2: 1, q3: 2, q4: 3 };

export type ReportingMonthStateType = "closed" | "current" | "upcoming";

export type ReportingMonthSlotType = {
  year: number;
  /** 0-based, as `Date#getMonth`. */
  month: number;
  state: ReportingMonthStateType;
  from: string;
  /** End of today for the current month, so a day-stable window caches for the day; end of the month otherwise. */
  to: string;
  lyFrom: string;
  /** Always the whole month last year: the current month compares its projection, which is a whole month too. */
  lyTo: string;
  daysPassed: number;
  daysInMonth: number;
};

export type ReportingPeriodTotalsType = { amount: number; count: number };

/** One month slot's figures as the statistics return them, Cancelled orders already left out. */
export type ReportingRawMonthType = {
  totals?: ReportingPeriodTotalsType;
  lastYear?: ReportingPeriodTotalsType;
};

export type ReportingMonthType = ReportingMonthSlotType & {
  /** null for an upcoming month. */
  revenue: number | null;
  orders: number | null;
  /** null when there are no orders (shown as "—", never as 0 or NaN). */
  aov: number | null;
  /** Month-end projection; set for the current month only. */
  projectedRevenue: number | null;
  lastYearRevenue: number | null;
  lastYearOrders: number | null;
  lastYearAov: number | null;
  /** Percent vs the same month last year; null without a last-year baseline. */
  revenueChange: number | null;
  aovChange: number | null;
  /** Percent vs the month before (the current month compares its projection); null without a baseline. */
  revenueMonthChange: number | null;
  aovMonthChange: number | null;
};

export type ReportingCurrentMonthType = {
  year: number;
  month: number;
  revenue: number;
  projectedRevenue: number | null;
  daysPassed: number;
  daysInMonth: number;
};

export type ReportingSummaryType = {
  averageRevenuePerClosedMonth: number | null;
  /** Revenue / orders over every month that has data, not an average of monthly AOVs. */
  periodAov: number | null;
  /** Period totals over the months with data. */
  revenue: number;
  orders: number;
  /**
   * Percent vs the same months last year. The current month's last-year figure is prorated to the same day, so a
   * partial month is compared with a partial month.
   */
  revenueChange: number | null;
  ordersChange: number | null;
  aovChange: number | null;
  currentMonth: ReportingCurrentMonthType | null;
};

function daysIn(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstMonthOf(period: ReportingPeriodType, now: Date): { year: number; month: number; length: number } {
  const year = now.getFullYear();
  const rolling = ROLLING_MONTHS[period];
  if (rolling) {
    return { year, month: now.getMonth() - rolling + 1, length: rolling };
  }
  const quarter = QUARTERS[period];
  if (quarter !== undefined) {
    return { year, month: quarter * MONTHS_IN_QUARTER, length: MONTHS_IN_QUARTER };
  }
  return { year, month: 0, length: REPORTING_MONTH_SLOTS };
}

/** The months a period covers, oldest first, each with its own and last year's date window. */
export function buildReportingMonths(period: ReportingPeriodType, now: Date = new Date()): ReportingMonthSlotType[] {
  const start = firstMonthOf(period, now);
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();

  return Array.from({ length: start.length }, (_, i) => {
    // Date normalizes a negative or overflowing month into the right year.
    const first = new Date(start.year, start.month + i, 1);
    const year = first.getFullYear();
    const month = first.getMonth();
    const daysInMonth = daysIn(year, month);
    const isCurrent = year === todayYear && month === todayMonth;
    const isUpcoming = year > todayYear || (year === todayYear && month > todayMonth);

    let state: ReportingMonthStateType = "closed";
    if (isCurrent) {
      state = "current";
    } else if (isUpcoming) {
      state = "upcoming";
    }

    return {
      year,
      month,
      state,
      from: iso(local(year, month, 1)),
      to: iso(isCurrent ? eod(year, month, now.getDate()) : eod(year, month, daysInMonth)),
      lyFrom: iso(local(year - 1, month, 1)),
      lyTo: iso(eod(year - 1, month, daysIn(year - 1, month))),
      daysPassed: isCurrent ? now.getDate() : daysInMonth,
      daysInMonth,
    };
  });
}

function average(totals: ReportingPeriodTotalsType | null | undefined): number | null {
  return totals && totals.count > 0 ? totals.amount / totals.count : null;
}

export type ReportingChangeDirectionType = "up" | "down" | "flat";

/** The direction of a percent change as printed, so a change that reads "0.0%" is flat rather than up or down. */
export function changeDirection(percent: number): ReportingChangeDirectionType {
  const scale = 10 ** REPORTING_PERCENT_DIGITS;
  // Half away from zero, as Intl rounds the printed figure.
  const printed = (Math.sign(percent) * Math.round(Math.abs(percent) * scale)) / scale;
  if (printed === 0) {
    return "flat";
  }
  return printed > 0 ? "up" : "down";
}

/** Percent change, or null when there is no positive baseline to compare with. */
export function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous <= 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

export function toReportingMonth(slot: ReportingMonthSlotType, raw: ReportingRawMonthType): ReportingMonthType {
  const isUpcoming = slot.state === "upcoming";
  const current = isUpcoming ? null : (raw.totals ?? null);
  const lastYear = raw.lastYear ?? null;

  const canProject = slot.state === "current" && current !== null;
  const factor = slot.daysInMonth / slot.daysPassed;
  const projectedRevenue = canProject ? current.amount * factor : null;

  const revenue = current?.amount ?? null;
  const aov = average(current);
  const lastYearRevenue = lastYear?.amount ?? null;
  const lastYearAov = average(lastYear);

  return {
    ...slot,
    revenue,
    orders: current?.count ?? null,
    aov,
    projectedRevenue,
    lastYearRevenue,
    lastYearOrders: lastYear?.count ?? null,
    lastYearAov,
    revenueChange: percentChange(projectedRevenue ?? revenue, lastYearRevenue),
    aovChange: percentChange(aov, lastYearAov),
    revenueMonthChange: null,
    aovMonthChange: null,
  };
}

/** The month just before a period starts: the baseline for the first month's "vs previous month". */
export function previousMonthWindow(period: ReportingPeriodType, now: Date = new Date()): { from: string; to: string } {
  const start = firstMonthOf(period, now);
  const first = new Date(start.year, start.month - 1, 1);
  const year = first.getFullYear();
  const month = first.getMonth();
  return { from: iso(local(year, month, 1)), to: iso(eod(year, month, daysIn(year, month))) };
}

/** Fills the "vs previous month" figures; `before` is the month preceding the first one. */
export function withMonthChanges(
  months: ReportingMonthType[],
  before?: ReportingPeriodTotalsType,
): ReportingMonthType[] {
  let previousRevenue = before?.amount ?? null;
  let previousAov = average(before);

  return months.map((month) => {
    const result = {
      ...month,
      revenueMonthChange: percentChange(month.projectedRevenue ?? month.revenue, previousRevenue),
      aovMonthChange: percentChange(month.aov, previousAov),
    };
    previousRevenue = month.revenue;
    previousAov = month.aov;
    return result;
  });
}

export type ReportingMetricType = "sales" | "aov";

/** Last year's figure as a baseline: null when last year had no sales that month, so it reads "—", not a real $0. */
export function lastYearBaseline(month: ReportingMonthType, metric: ReportingMetricType): number | null {
  if (metric === "aov") {
    return month.lastYearAov;
  }
  return (month.lastYearRevenue ?? 0) > 0 ? month.lastYearRevenue : null;
}

export function summarizeReporting(months: ReportingMonthType[]): ReportingSummaryType {
  const closed = months.filter((month) => month.state === "closed");
  const withData = months.filter((month) => month.state !== "upcoming");

  const sum = (items: ReportingMonthType[], pick: (month: ReportingMonthType) => number | null): number =>
    items.reduce((total, month) => total + (pick(month) ?? 0), 0);
  // Last year's figure for the same span: the current month only up to the same day of last year's month, whose
  // length can differ (February in and after a leap year).
  const share = (month: ReportingMonthType): number => {
    if (month.state !== "current") {
      return 1;
    }
    const lastYearDays = daysIn(month.year - 1, month.month);
    return Math.min(month.daysPassed, lastYearDays) / lastYearDays;
  };
  const hasLastYear = withData.some((month) => month.lastYearRevenue !== null);

  const revenue = sum(withData, (month) => month.revenue);
  const orders = sum(withData, (month) => month.orders);
  const lastYearRevenue = hasLastYear ? sum(withData, (month) => (month.lastYearRevenue ?? 0) * share(month)) : null;
  const lastYearOrders = hasLastYear ? sum(withData, (month) => (month.lastYearOrders ?? 0) * share(month)) : null;
  const periodAov = orders > 0 ? revenue / orders : null;
  const lastYearAov = lastYearRevenue !== null && lastYearOrders ? lastYearRevenue / lastYearOrders : null;

  const current = months.find((month) => month.state === "current");

  return {
    averageRevenuePerClosedMonth: closed.length ? sum(closed, (month) => month.revenue) / closed.length : null,
    periodAov,
    revenue,
    orders,
    revenueChange: percentChange(revenue, lastYearRevenue),
    ordersChange: percentChange(orders, lastYearOrders),
    aovChange: percentChange(periodAov, lastYearAov),
    currentMonth: current
      ? {
          year: current.year,
          month: current.month,
          revenue: current.revenue ?? 0,
          projectedRevenue: current.projectedRevenue,
          daysPassed: current.daysPassed,
          daysInMonth: current.daysInMonth,
        }
      : null,
  };
}

/** What one selection asks for: its period, the months it covers and the month before them. */
export type ReportingPlanType = {
  period: ReportingPeriodType;
  months: ReportingMonthSlotType[];
  /** The first month's "vs previous month" baseline. */
  previous: { from: string; to: string };
};

/**
 * The figures a caller hands the report, kept together with the plan they were fetched for: a query's month slots are
 * positional, so the figures of one period must never be read against the months of another.
 */
export type ReportingDataType = {
  plan: ReportingPlanType;
  /** One entry per `plan.months` slot, in the same order; a missing entry reads as no orders. */
  months: readonly (ReportingRawMonthType | undefined)[];
  /** The month before the period, for the first month's "vs previous month". */
  previous?: ReportingPeriodTotalsType;
  currencyCode: string;
};

export function buildReportingPlan(period: ReportingPeriodType, now: Date = new Date()): ReportingPlanType {
  return { period, months: buildReportingMonths(period, now), previous: previousMonthWindow(period, now) };
}

/** Whether two plans ask for the same date windows (12 months and the current year do in December). */
export function isSameWindows(a: ReportingPlanType, b: ReportingPlanType): boolean {
  return (
    a.previous.from === b.previous.from &&
    a.months.length === b.months.length &&
    a.months.every((month, i) => month.from === b.months[i].from && month.to === b.months[i].to)
  );
}

/** The months of a fetched plan with their figures and their "vs previous month" changes. */
export function toReportingMonths(data: Pick<ReportingDataType, "plan" | "months" | "previous">): ReportingMonthType[] {
  return withMonthChanges(
    data.plan.months.map((month, i) => toReportingMonth(month, data.months[i] ?? {})),
    data.previous,
  );
}

/**
 * A statistics query's month windows for one plan, under the variable names every reporting query uses:
 * `use{i}` / `from{i}` / `to{i}` / `lyFrom{i}` / `lyTo{i}` per slot and `prevFrom` / `prevTo`. A slot the period leaves
 * empty, or a month to come, is not asked for.
 */
export type ReportingVariablesType = { prevFrom: string; prevTo: string } & {
  [I in ReportingSlotIndexType as `use${I}`]: boolean;
} & {
  [I in ReportingSlotIndexType as `${"from" | "to" | "lyFrom" | "lyTo"}${I}`]?: string;
};

export function buildReportingVariables(plan: ReportingPlanType): ReportingVariablesType {
  const variables: Record<string, string | boolean | undefined> = {
    prevFrom: plan.previous.from,
    prevTo: plan.previous.to,
  };
  for (const i of MONTH_SLOT_INDEXES) {
    const month = plan.months.at(i);
    variables[`use${i}`] = month !== undefined && month.state !== "upcoming";
    variables[`from${i}`] = month?.from;
    variables[`to${i}`] = month?.to;
    variables[`lyFrom${i}`] = month?.lyFrom;
    variables[`lyTo${i}`] = month?.lyTo;
  }
  return variables as ReportingVariablesType;
}

type ReportingStatisticsSlotType = { total: { amount: number }; count: number } | null;

/** A statistics response under the aliases every reporting query uses: `m{i}`, `ly{i}` per slot and `prev`. */
export type ReportingStatisticsType = { currencyCode: string; prev?: ReportingStatisticsSlotType } & {
  [slot: `${"m" | "ly"}${number}`]: ReportingStatisticsSlotType | undefined;
};

function toTotals(slot: ReportingStatisticsSlotType | undefined): ReportingPeriodTotalsType | undefined {
  return slot ? { amount: slot.total.amount, count: slot.count } : undefined;
}

/** One response as the report reads it. `plan` must be the plan the response was fetched for. */
export function toReportingData(plan: ReportingPlanType, statistics: ReportingStatisticsType): ReportingDataType {
  return {
    plan,
    months: plan.months.map((_month, i) => ({
      totals: toTotals(statistics[`m${i}`]),
      lastYear: toTotals(statistics[`ly${i}`]),
    })),
    previous: toTotals(statistics.prev),
    currencyCode: statistics.currencyCode,
  };
}
