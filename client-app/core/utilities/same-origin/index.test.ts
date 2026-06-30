import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { toSameOriginPath } from "./index";

describe("toSameOriginPath", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { origin: "https://example.com", href: "https://example.com/" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("returns a same-origin relative path unchanged", () => {
    expect(toSameOriginPath("/company/members")).toBe("/company/members");
  });

  it("preserves query and hash on a same-origin path", () => {
    expect(toSameOriginPath("/account?tab=orders#top")).toBe("/account?tab=orders#top");
  });

  it("keeps a same-origin absolute URL but strips the origin", () => {
    expect(toSameOriginPath("https://example.com/dashboard")).toBe("/dashboard");
  });

  it("falls back to '/' for a cross-origin absolute URL", () => {
    expect(toSameOriginPath("https://example.org/phish")).toBe("/");
  });

  it("falls back to '/' for a protocol-relative URL", () => {
    expect(toSameOriginPath("//example.org")).toBe("/");
  });

  it("falls back to '/' for empty / nullish input", () => {
    expect(toSameOriginPath("")).toBe("/");
    expect(toSameOriginPath(null)).toBe("/");
    expect(toSameOriginPath(undefined)).toBe("/");
  });

  it("uses a custom fallback when provided", () => {
    expect(toSameOriginPath("https://example.org", "/safe")).toBe("/safe");
  });
});
