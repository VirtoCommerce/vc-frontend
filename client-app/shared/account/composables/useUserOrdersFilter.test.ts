import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DateFilterId } from "@/core/enums";
import { useUserOrdersFilter } from "./useUserOrdersFilter";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: (value: unknown) => String(value),
  }),
}));

vi.mock("./useUser", () => ({
  useUser: () => ({
    checkPermissions: () => false,
  }),
}));

vi.mock("./useUserOrders", async () => {
  const { ref } = await import("vue");
  return { facets: ref([]) };
});

function getRange(id: string) {
  const { dateFilterTypes } = useUserOrdersFilter();
  const range = dateFilterTypes.value.find((item) => item.id === id);
  return { startDate: range?.startDate, endDate: range?.endDate };
}

function getLastWeekRange() {
  return getRange(DateFilterId.LAST_WEEK);
}

function getLastMonthRange() {
  return getRange(DateFilterId.LAST_MONTH);
}

// Local midnight, the same way the composable builds its dates.
function localDate(year: number, monthIndex: number, day: number): string {
  return new Date(year, monthIndex, day).toISOString();
}

describe("useUserOrdersFilter — Last week date preset", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the previous calendar week when the current week started in the previous month", () => {
    // Friday, Oct 2 2026 — the current week started on Monday, Sep 28 2026.
    vi.setSystemTime(new Date(2026, 9, 2, 10, 30));

    expect(getLastWeekRange()).toEqual({
      startDate: localDate(2026, 8, 21),
      endDate: localDate(2026, 8, 28),
    });
  });

  it("returns the previous calendar week when the current week started in the same month", () => {
    // Wednesday, Oct 14 2026 — the current week started on Monday, Oct 12 2026.
    vi.setSystemTime(new Date(2026, 9, 14, 10, 30));

    expect(getLastWeekRange()).toEqual({
      startDate: localDate(2026, 9, 5),
      endDate: localDate(2026, 9, 12),
    });
  });

  it("returns the previous calendar week when the current week started in the previous year", () => {
    // Saturday, Jan 2 2027 — the current week started on Monday, Dec 28 2026.
    vi.setSystemTime(new Date(2027, 0, 2, 10, 30));

    expect(getLastWeekRange()).toEqual({
      startDate: localDate(2026, 11, 21),
      endDate: localDate(2026, 11, 28),
    });
  });
});

describe("useUserOrdersFilter — Last month date preset", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the previous calendar month when today's day number does not exist in it", () => {
    // Wednesday, Mar 31 2027 — February 2027 has 28 days.
    vi.setSystemTime(new Date(2027, 2, 31, 10, 30));

    expect(getLastMonthRange()).toEqual({
      startDate: localDate(2027, 1, 1),
      endDate: localDate(2027, 2, 1),
    });
  });

  it("returns the previous calendar month on the 31st after a 30-day month", () => {
    // Saturday, Oct 31 2026 — September has 30 days.
    vi.setSystemTime(new Date(2026, 9, 31, 10, 30));

    expect(getLastMonthRange()).toEqual({
      startDate: localDate(2026, 8, 1),
      endDate: localDate(2026, 9, 1),
    });
  });

  it("returns the previous calendar month on a day that exists in it", () => {
    // Monday, Oct 5 2026.
    vi.setSystemTime(new Date(2026, 9, 5, 10, 30));

    expect(getLastMonthRange()).toEqual({
      startDate: localDate(2026, 8, 1),
      endDate: localDate(2026, 9, 1),
    });
  });

  it("returns December of the previous year in January", () => {
    // Sunday, Jan 31 2027.
    vi.setSystemTime(new Date(2027, 0, 31, 10, 30));

    expect(getLastMonthRange()).toEqual({
      startDate: localDate(2026, 11, 1),
      endDate: localDate(2027, 0, 1),
    });
  });
});
