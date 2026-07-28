import { describe, expect, it } from "vitest";
import { buildStatisticsWindows } from "./utils";

describe("buildStatisticsWindows", () => {
  it("clamps the previous-month window to the current month start when the current month has run longer than the previous month", () => {
    // Mar 31: ~30 days elapsed since Mar 1, but February is shorter — the elapsed-matched
    // point (Feb 1 + 30d) would land in March and overlap the current MTD window.
    const now = new Date(Date.UTC(2025, 2, 31, 12, 0, 0));
    const w = buildStatisticsWindows(now);

    expect(w.mtdFrom).toBe("2025-03-01T00:00:00.000Z");
    expect(w.prevFrom).toBe("2025-02-01T00:00:00.000Z");
    // Clamped to the month start (== mtdFrom); without the clamp it would be 2025-03-03T12:00:00Z.
    expect(w.prevTo).toBe("2025-03-01T00:00:00.000Z");
    // The previous window must never reach into the current period.
    expect(new Date(w.prevTo).getTime()).toBeLessThanOrEqual(new Date(w.mtdFrom).getTime());
  });

  it("keeps the previous-month window elapsed-matched (no clamp) mid-month", () => {
    // Mar 15: ~15 days into March (bound rounded to end of the UTC day); Feb 1 + that span = Feb 15,
    // still inside February — no clamp.
    const now = new Date(Date.UTC(2025, 2, 15, 12, 0, 0));
    const w = buildStatisticsWindows(now);

    expect(w.prevFrom).toBe("2025-02-01T00:00:00.000Z");
    expect(w.prevTo).toBe("2025-02-15T23:59:59.999Z");
    expect(new Date(w.prevTo).getTime()).toBeLessThan(new Date(w.mtdFrom).getTime());
  });

  it("clamps the last-year window to the current year start on Dec 31 of a leap year", () => {
    // 2024 is a leap year (366 days); 2023 is not. Elapsed since Jan 1 2024 (365d12h) added to
    // Jan 1 2023 would land in 2024 without the clamp.
    const now = new Date(Date.UTC(2024, 11, 31, 12, 0, 0));
    const w = buildStatisticsWindows(now);

    expect(w.ytdFrom).toBe("2024-01-01T00:00:00.000Z");
    expect(w.lastYearFrom).toBe("2023-01-01T00:00:00.000Z");
    // Clamped to the year start (== ytdFrom); without the clamp it would be 2024-01-01T12:00:00Z.
    expect(w.lastYearTo).toBe("2024-01-01T00:00:00.000Z");
    expect(new Date(w.lastYearTo).getTime()).toBeLessThanOrEqual(new Date(w.ytdFrom).getTime());
  });

  it("never clamps the weekly window (weeks are always 7 days)", () => {
    const now = new Date(Date.UTC(2025, 2, 12, 9, 30, 0)); // a Wednesday
    const w = buildStatisticsWindows(now);

    // The elapsed part of a week can't exceed a full previous week, so the previous-week end
    // always stays strictly before the current week start.
    expect(new Date(w.prevWeekTo).getTime()).toBeLessThan(new Date(w.weekFrom).getTime());
  });

  it("rounds the upper bound of every current-period window to the end of the UTC day (for cache stability)", () => {
    // Any instant within the day maps to the same end-of-day bound, so co-occurring requests share
    // a cache key regardless of the exact time they fire.
    const now = new Date(Date.UTC(2025, 5, 10, 8, 15, 0));
    const dayEnd = "2025-06-10T23:59:59.999Z";
    const w = buildStatisticsWindows(now);

    expect(w.mtdTo).toBe(dayEnd);
    expect(w.ytdTo).toBe(dayEnd);
    expect(w.weekTo).toBe(dayEnd);
    expect(w.todayTo).toBe(dayEnd);
    expect(w.todayFrom).toBe("2025-06-10T00:00:00.000Z");
  });
});
