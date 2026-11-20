import { describe, expect, it } from "vitest";
import { resolveEmptyViewMedia } from "./empty-view";

describe("resolveEmptyViewMedia", () => {
  it("shows the entity for a content reason", () => {
    expect(resolveEmptyViewMedia({ reason: "no-data", entity: "orders" })).toEqual({
      reason: "no-data",
      tone: "primary",
      glyph: "receipt-text",
      icon: "orders",
    });
  });

  it("shows the reason itself for a system reason, whatever the entity", () => {
    expect(resolveEmptyViewMedia({ reason: "no-results", entity: "orders" })).toEqual({
      reason: "no-results",
      tone: "secondary",
      glyph: "search-x",
      icon: "no-results",
    });
  });

  it("uses the danger tone for errors and missing access", () => {
    expect(resolveEmptyViewMedia({ reason: "error" }).tone).toBe("danger");
    expect(resolveEmptyViewMedia({ reason: "no-access" }).icon).toBe("access-denied");
  });

  it("falls back to the generic icon when a content reason has no entity", () => {
    expect(resolveEmptyViewMedia({ reason: "no-data" })).toMatchObject({ glyph: "zoom-out", icon: "nothing-found" });
  });

  it("uses the closest drawn icon for an entity without its own", () => {
    expect(resolveEmptyViewMedia({ reason: "no-data", entity: "branches" })).toMatchObject({
      glyph: "store",
      icon: "addresses",
    });
  });

  it("maps the legacy variant to a reason and lets reason win", () => {
    expect(resolveEmptyViewMedia({ variant: "search" }).reason).toBe("no-results");
    expect(resolveEmptyViewMedia({ variant: "error" }).reason).toBe("error");
    expect(resolveEmptyViewMedia({ variant: "search", reason: "no-data" }).reason).toBe("no-data");
  });

  it("maps a known legacy icon name to an entity and keeps an unknown one as the glyph", () => {
    expect(resolveEmptyViewMedia({ icon: "outline-order" })).toMatchObject({ glyph: "receipt-text", icon: "orders" });
    expect(resolveEmptyViewMedia({ icon: "truck-fast" })).toMatchObject({ glyph: "truck-fast", icon: "nothing-found" });
  });

  it("falls back to no-data for an unknown reason", () => {
    expect(resolveEmptyViewMedia({ reason: "unknown" as VcEmptyViewReasonType }).reason).toBe("no-data");
  });
});
