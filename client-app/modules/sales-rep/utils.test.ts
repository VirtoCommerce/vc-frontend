import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BUYER_ORDER_ROUTE_NAME, CUSTOMER_ORDER_ROUTE_NAME } from "./constants";
import { formatHourLabel, formatTimeAgo, salesRepOrderRoute } from "./utils";
import type { SalesRepCustomerOrderRowType } from "./types";

// Pinned so the expectations don't depend on the runtime's default locale.
vi.mock("@/core/globals", () => ({ globals: { cultureName: "en-US" } }));

// Built with local-time constructors, so a wall-clock expectation holds in whatever zone the suite runs in.
const localIso = (year: number, month: number, day: number, h = 0, min = 0, s = 0, ms = 0): string =>
  new Date(year, month, day, h, min, s, ms).toISOString();

describe("salesRepOrderRoute", () => {
  const row = (isOwn: boolean): SalesRepCustomerOrderRowType => ({
    id: "o-1",
    number: "CO260821-00001",
    organizationId: "org-of-the-order",
    organizationName: "Contoso Bank",
    createdDate: "2026-08-21T00:00:00Z",
    status: "New",
    statusDisplayValue: "New",
    total: "$10.00",
    isOwn,
  });

  it("sends an order the rep placed to the buyer-facing page", () => {
    expect(salesRepOrderRoute(row(true), "org-in-the-url")).toEqual({
      name: BUYER_ORDER_ROUTE_NAME,
      params: { orderId: "o-1" },
    });
  });

  it("sends someone else's order to the read-only hub page", () => {
    expect(salesRepOrderRoute(row(false), "org-in-the-url")).toEqual({
      name: CUSTOMER_ORDER_ROUTE_NAME,
      params: { organizationId: "org-in-the-url", orderId: "o-1" },
    });
  });

  it("falls back to the order's own customer when the page has none", () => {
    expect(salesRepOrderRoute(row(false))).toEqual({
      name: CUSTOMER_ORDER_ROUTE_NAME,
      params: { organizationId: "org-of-the-order", orderId: "o-1" },
    });
  });
});

describe("formatTimeAgo", () => {
  const NOW = new Date(2026, 8, 15, 12, 0, 0);
  const ago = (seconds: number): string => new Date(NOW.getTime() - seconds * 1000).toISOString();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("speaks in the past tense", () => {
    expect(formatTimeAgo(ago(3 * 3600))).toBe("3 hours ago");
  });

  // At a unit's threshold the row is already that unit.
  it("switches unit exactly at its threshold", () => {
    expect(formatTimeAgo(ago(60))).toBe("1 minute ago");
    expect(formatTimeAgo(ago(3600))).toBe("1 hour ago");
  });

  // Floored, not rounded up: 119 seconds is still one minute.
  it("rounds down within a unit", () => {
    expect(formatTimeAgo(ago(119))).toBe("1 minute ago");
  });

  it("picks the largest unit that fits", () => {
    expect(formatTimeAgo(ago(2 * 86400 + 5 * 3600))).toBe("2 days ago");
  });

  it("names anything under a minute without a number", () => {
    expect(formatTimeAgo(ago(30))).toBe("this minute");
  });

  // Clock skew between server and browser must not read as an event still to come.
  it("treats a timestamp slightly ahead of the clock as now", () => {
    expect(formatTimeAgo(ago(-90))).toBe("this minute");
  });
});

describe("formatHourLabel", () => {
  // Built from local-time parts (`localIso`), so the label holds in any zone. Whitespace is
  // normalized: some ICU versions put a narrow no-break space before the day period.
  it("labels the bucket's wall-clock hour", () => {
    expect(formatHourLabel(localIso(2026, 8, 15, 14)).replace(/\s/g, " ")).toBe("2:00 PM");
  });
});
