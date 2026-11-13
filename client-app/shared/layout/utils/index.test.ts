import { describe, expect, it } from "vitest";
import { formatHeaderBadgeCount } from "./index";

describe("formatHeaderBadgeCount", () => {
  it.each([
    [1, "1"],
    [99, "99"],
    [100, "99+"],
    [1_000_000, "99+"],
  ])("formats %i as %s", (count, expected) => {
    expect(formatHeaderBadgeCount(count)).toBe(expected);
  });
});
