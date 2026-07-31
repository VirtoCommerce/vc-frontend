import { describe, expect, it } from "vitest";
import { buildStatisticsWindows } from "./utils";

// The windows are the user's calendar days expressed as UTC instants, so every expectation is built with
// local-time constructors too — that keeps the suite meaningful in whatever zone it runs in (CI, a dev box
// at UTC−5, a rep at UTC+3) instead of only passing at UTC.
const localIso = (year: number, month: number, day: number, h = 0, min = 0, s = 0, ms = 0): string =>
  new Date(year, month, day, h, min, s, ms).toISOString();

describe("buildStatisticsWindows", () => {
  it("clamps the previous-month window to the current month start when the current month has run longer than the previous month", () => {
    // Mar 31: ~30 days elapsed since Mar 1, but February is shorter — the elapsed-matched
    // point (Feb 1 + 30d) would land in March and overlap the current MTD window.
    const now = new Date(2025, 2, 31, 12, 0, 0);
    const w = buildStatisticsWindows(now);

    expect(w.mtdFrom).toBe(localIso(2025, 2, 1));
    expect(w.prevFrom).toBe(localIso(2025, 1, 1));
    // Clamped to the month start (== mtdFrom); without the clamp it would land on Mar 3.
    expect(w.prevTo).toBe(localIso(2025, 2, 1));
    // The previous window must never reach into the current period.
    expect(new Date(w.prevTo).getTime()).toBeLessThanOrEqual(new Date(w.mtdFrom).getTime());
  });

  it("keeps the previous-month window elapsed-matched (no clamp) mid-month", () => {
    // Mar 15: ~15 days into March (bound rounded to end of the local day); Feb 1 + that span = Feb 15,
    // still inside February — no clamp.
    const now = new Date(2025, 2, 15, 12, 0, 0);
    const w = buildStatisticsWindows(now);

    expect(w.prevFrom).toBe(localIso(2025, 1, 1));
    // Elapsed-matched spans are millisecond arithmetic, so a DST transition between the two periods can
    // shift the instant by an hour — the day it lands on is the contract, not the wall clock.
    const prevTo = new Date(w.prevTo);
    expect(prevTo.getMonth()).toBe(1);
    expect(prevTo.getDate()).toBe(15);
    expect(prevTo.getTime()).toBeLessThan(new Date(w.mtdFrom).getTime());
  });

  it("clamps the last-year window to the current year start on Dec 31 of a leap year", () => {
    // 2024 is a leap year (366 days); 2023 is not. Elapsed since Jan 1 2024 (365d+) added to
    // Jan 1 2023 would land in 2024 without the clamp.
    const now = new Date(2024, 11, 31, 12, 0, 0);
    const w = buildStatisticsWindows(now);

    expect(w.ytdFrom).toBe(localIso(2024, 0, 1));
    expect(w.lastYearFrom).toBe(localIso(2023, 0, 1));
    // Clamped to the year start (== ytdFrom).
    expect(w.lastYearTo).toBe(localIso(2024, 0, 1));
    expect(new Date(w.lastYearTo).getTime()).toBeLessThanOrEqual(new Date(w.ytdFrom).getTime());
  });

  it("never clamps the weekly window (weeks are always 7 days)", () => {
    const now = new Date(2025, 2, 12, 9, 30, 0); // a Wednesday
    const w = buildStatisticsWindows(now);

    // Monday-start week, and the previous week starts exactly seven calendar days earlier.
    expect(w.weekFrom).toBe(localIso(2025, 2, 10));
    expect(w.prevWeekFrom).toBe(localIso(2025, 2, 3));
    // The elapsed part of a week can't exceed a full previous week, so the previous-week end
    // always stays strictly before the current week start.
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
    expect(w.todayTo).toBe(dayEnd);
    expect(w.todayFrom).toBe(localIso(2025, 5, 10));
  });

  it("puts the day boundary at the user's midnight, not UTC's", () => {
    // The reported defect: on UTC boundaries an order placed at 23:00 UTC is already "tomorrow" for a
    // UTC+3 rep (and "yesterday" evening lands in UTC today for a UTC−5 one), so the "created today"
    // badge disagreed with the order list beside it, which renders createdDate in the browser's zone.
    const now = new Date(2026, 6, 31, 10, 0, 0);
    const w = buildStatisticsWindows(now);

    const from = new Date(w.todayFrom);
    const to = new Date(w.todayTo);

    // Midnight → 23:59:59.999 on the *user's* clock.
    expect([from.getHours(), from.getMinutes(), from.getSeconds(), from.getMilliseconds()]).toEqual([0, 0, 0, 0]);
    expect([to.getHours(), to.getMinutes(), to.getSeconds(), to.getMilliseconds()]).toEqual([23, 59, 59, 999]);
    expect(from.getDate()).toBe(31);
    expect(to.getDate()).toBe(31);

    // An order the rep sees stamped "today" is inside the window at both ends of the day…
    const justAfterMidnight = new Date(2026, 6, 31, 0, 30, 0).getTime();
    const lateEvening = new Date(2026, 6, 31, 23, 30, 0).getTime();
    expect(justAfterMidnight).toBeGreaterThanOrEqual(from.getTime());
    expect(lateEvening).toBeLessThanOrEqual(to.getTime());

    // …and yesterday's late-evening order stays out of it.
    expect(new Date(2026, 6, 30, 23, 30, 0).getTime()).toBeLessThan(from.getTime());
  });

  it("anchors every period start to the user's midnight", () => {
    const w = buildStatisticsWindows(new Date(2025, 4, 21, 16, 45, 0));

    for (const bound of [w.mtdFrom, w.prevFrom, w.ytdFrom, w.lastYearFrom, w.weekFrom, w.prevWeekFrom, w.todayFrom]) {
      const date = new Date(bound);
      expect([date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()]).toEqual([0, 0, 0, 0]);
    }
  });
});
