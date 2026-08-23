import { describe, expect, it, vi } from "vitest";
import { buildStatisticsWindows, formatStatCount, formatStatMoney } from "./utils";

// Pinned so the expectations don't depend on the runtime's default locale.
vi.mock("@/core/globals", () => ({ globals: { cultureName: "en-US", currencyCode: "USD" } }));

// The windows are the user's calendar days expressed as UTC instants, so every expectation is built with
// local-time constructors too — that keeps the suite meaningful in whatever zone it runs in (CI, a dev box
// at UTC−5, a rep at UTC+3) instead of only passing at UTC.
const localIso = (year: number, month: number, day: number, h = 0, min = 0, s = 0, ms = 0): string =>
  new Date(year, month, day, h, min, s, ms).toISOString();

describe("buildStatisticsWindows", () => {
  it("clamps the previous-month window to the current month start when the day overflows the previous month", () => {
    // Mar 31: "Feb 31" doesn't exist, so the matched position normalizes forward into March and would
    // overlap the current MTD window.
    const now = new Date(2025, 2, 31, 12, 0, 0);
    const w = buildStatisticsWindows(now);

    expect(w.mtdFrom).toBe(localIso(2025, 2, 1));
    expect(w.prevFrom).toBe(localIso(2025, 1, 1));
    // Clamped to the month start (== mtdFrom); without the clamp it would land on Mar 3.
    expect(w.prevTo).toBe(localIso(2025, 2, 1));
    // The previous window must never reach into the current period.
    expect(new Date(w.prevTo).getTime()).toBeLessThanOrEqual(new Date(w.mtdFrom).getTime());
  });

  it("matches the previous-month window to the same day of that month (no clamp) mid-month", () => {
    // Mar 15 → the baseline runs Feb 1 through the end of Feb 15: equal spans, no overflow to clamp.
    const now = new Date(2025, 2, 15, 12, 0, 0);
    const w = buildStatisticsWindows(now);

    expect(w.prevFrom).toBe(localIso(2025, 1, 1));
    expect(w.prevTo).toBe(localIso(2025, 1, 15, 23, 59, 59, 999));
    expect(new Date(w.prevTo).getTime()).toBeLessThan(new Date(w.mtdFrom).getTime());
  });

  it("keeps the last-year window inside the previous year on Dec 31 of a leap year", () => {
    // 2024 is a leap year (366 days), 2023 is not — a day-count-based baseline would overshoot into 2024.
    // The calendar move lands on the same month/day a year back, so it can't leave 2023 at all.
    const now = new Date(2024, 11, 31, 12, 0, 0);
    const w = buildStatisticsWindows(now);

    expect(w.ytdFrom).toBe(localIso(2024, 0, 1));
    expect(w.lastYearFrom).toBe(localIso(2023, 0, 1));
    expect(w.lastYearTo).toBe(localIso(2023, 11, 31, 23, 59, 59, 999));
    expect(new Date(w.lastYearTo).getTime()).toBeLessThan(new Date(w.ytdFrom).getTime());
  });

  it("never clamps the weekly window (weeks are always 7 days)", () => {
    const now = new Date(2025, 2, 12, 9, 30, 0); // a Wednesday
    const w = buildStatisticsWindows(now);

    // Monday-start week, and the previous week starts exactly seven calendar days earlier.
    expect(w.weekFrom).toBe(localIso(2025, 2, 10));
    expect(w.prevWeekFrom).toBe(localIso(2025, 2, 3));
    // The baseline ends on the same weekday a week back, which is always at least a day before the
    // current week starts.
    expect(w.prevWeekTo).toBe(localIso(2025, 2, 5, 23, 59, 59, 999));
    expect(new Date(w.prevWeekTo).getTime()).toBeLessThan(new Date(w.weekFrom).getTime());
  });

  it("keeps the weekly baseline clear of the week start on a DST fall-back Sunday", () => {
    // Nov 2 2025 is the fall-back day in US zones, so the current week holds a 25-hour day. Projecting an
    // elapsed millisecond span would overshoot seven days and collide the baseline end with weekFrom.
    const w = buildStatisticsWindows(new Date(2025, 10, 2, 12, 0, 0));

    expect(w.weekFrom).toBe(localIso(2025, 9, 27));
    expect(w.prevWeekTo).toBe(localIso(2025, 9, 26, 23, 59, 59, 999));
    expect(new Date(w.prevWeekTo).getTime()).toBeLessThan(new Date(w.weekFrom).getTime());
  });

  it("rounds the upper bound of every current-period window to the end of the user's day (for cache stability)", () => {
    // Any instant within the day maps to the same end-of-day bound, so co-occurring requests share
    // a cache key regardless of the exact time they fire.
    const now = new Date(2025, 5, 10, 8, 15, 0);
    const dayEnd = localIso(2025, 5, 10, 23, 59, 59, 999);
    const w = buildStatisticsWindows(now);

    expect(w.mtdTo).toBe(dayEnd);
    expect(w.ytdTo).toBe(dayEnd);
    expect(w.weekTo).toBe(dayEnd);
    expect(w.recentTo).toBe(dayEnd);
  });

  it("spans a full 7 days of the rolling window, today included", () => {
    const now = new Date(2025, 5, 10, 8, 15, 0); // Tue Jun 10
    const w = buildStatisticsWindows(now);

    // Jun 4…Jun 10 inclusive — 6 days back, not 7, or the window would cover 8 calendar days.
    expect(w.recentFrom).toBe(localIso(2025, 5, 4));
    expect(w.recentTo).toBe(localIso(2025, 5, 10, 23, 59, 59, 999));
  });

  it("keeps the rolling window full on a Monday, when week-to-date would be nearly empty", () => {
    const monday = new Date(2025, 5, 9, 8, 15, 0);
    const w = buildStatisticsWindows(monday);

    expect(w.weekFrom).toBe(localIso(2025, 5, 9));
    expect(w.recentFrom).toBe(localIso(2025, 5, 3));
    expect(new Date(w.recentFrom).getTime()).toBeLessThan(new Date(w.weekFrom).getTime());
  });

  it("puts the day boundary at the user's midnight, not UTC's", () => {
    // The reported defect: on UTC boundaries an order placed at 23:00 UTC is already "tomorrow" for a
    // UTC+3 rep (and "yesterday" evening lands in UTC today for a UTC−5 one), so the recent-orders badge
    // disagreed with the order list beside it, which renders createdDate in the browser's zone.
    const now = new Date(2026, 6, 31, 10, 0, 0);
    const w = buildStatisticsWindows(now);

    const from = new Date(w.recentFrom);
    const to = new Date(w.recentTo);

    // Midnight → 23:59:59.999 on the *user's* clock.
    expect([from.getHours(), from.getMinutes(), from.getSeconds(), from.getMilliseconds()]).toEqual([0, 0, 0, 0]);
    expect([to.getHours(), to.getMinutes(), to.getSeconds(), to.getMilliseconds()]).toEqual([23, 59, 59, 999]);
    expect(from.getDate()).toBe(25);
    expect(to.getDate()).toBe(31);

    // An order the rep sees stamped inside the window stays inside it at both ends of the span…
    const firstDayJustAfterMidnight = new Date(2026, 6, 25, 0, 30, 0).getTime();
    const lastDayLateEvening = new Date(2026, 6, 31, 23, 30, 0).getTime();
    expect(firstDayJustAfterMidnight).toBeGreaterThanOrEqual(from.getTime());
    expect(lastDayLateEvening).toBeLessThanOrEqual(to.getTime());

    // …and the late-evening order from the day before the window stays out of it.
    expect(new Date(2026, 6, 24, 23, 30, 0).getTime()).toBeLessThan(from.getTime());
  });

  it("anchors every period start to the user's midnight", () => {
    const w = buildStatisticsWindows(new Date(2025, 4, 21, 16, 45, 0));

    for (const bound of [w.mtdFrom, w.prevFrom, w.ytdFrom, w.lastYearFrom, w.weekFrom, w.prevWeekFrom, w.recentFrom]) {
      const date = new Date(bound);
      expect([date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()]).toEqual([0, 0, 0, 0]);
    }
  });
});

describe("formatStatCount", () => {
  it("renders an absent count as 0 rather than a placeholder", () => {
    expect(formatStatCount()).toBe("0");
    expect(formatStatCount(null)).toBe("0");
  });

  it("groups thousands so counts match the grouping of the money figures beside them", () => {
    expect(formatStatCount(1234)).toBe("1,234");
    expect(formatStatCount(1234567)).toBe("1,234,567");
  });

  it("keeps a real zero and small counts unchanged", () => {
    expect(formatStatCount(0)).toBe("0");
    expect(formatStatCount(7)).toBe("7");
  });
});

describe("formatStatMoney", () => {
  it("passes through the backend-formatted amount", () => {
    expect(formatStatMoney({ formattedAmount: "$1,234.00" })).toBe("$1,234.00");
    expect(formatStatMoney({ formattedAmount: "$0.00" })).toBe("$0.00");
  });

  it("renders absent money as a zero in the query's currency, so a money slot never shows a bare 0", () => {
    expect(formatStatMoney()).toBe("$0.00");
    expect(formatStatMoney(null)).toBe("$0.00");
  });

  it("falls back to a plain 0 instead of throwing when no currency is configured yet", async () => {
    vi.doMock("@/core/globals", () => ({ globals: {} }));
    vi.resetModules();
    const { formatStatMoney: format } = await import("./utils");

    expect(format()).toBe("0");
    expect(format({ formattedAmount: "$5.00" })).toBe("$5.00");

    vi.doUnmock("@/core/globals");
    vi.resetModules();
  });
});
