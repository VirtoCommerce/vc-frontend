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

function getLastWeekRange() {
  const { dateFilterTypes } = useUserOrdersFilter();
  const lastWeekId: string = DateFilterId.LAST_WEEK;
  const lastWeek = dateFilterTypes.value.find((item) => item.id === lastWeekId);
  return { startDate: lastWeek?.startDate, endDate: lastWeek?.endDate };
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
