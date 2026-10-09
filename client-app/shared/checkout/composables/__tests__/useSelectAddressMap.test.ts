import { describe, it, expect } from "vitest";
import { isPrefixExtension } from "../useSelectAddressMap";

describe("isPrefixExtension", () => {
  it("returns true for an empty old list in both modes", () => {
    expect(isPrefixExtension([], ["a", "b"])).toBe(true);
    expect(isPrefixExtension([], ["a", "b"], { strict: true })).toBe(true);
  });

  it("returns true for an empty old list against an empty new list (non-strict only)", () => {
    expect(isPrefixExtension([], [])).toBe(true);
    expect(isPrefixExtension([], [], { strict: true })).toBe(false);
  });

  it("treats an identical array as a prefix in non-strict mode but not in strict mode", () => {
    expect(isPrefixExtension(["a", "b"], ["a", "b"])).toBe(true);
    expect(isPrefixExtension(["a", "b"], ["a", "b"], { strict: true })).toBe(false);
  });

  it("requires the new list to be strictly longer in strict mode", () => {
    expect(isPrefixExtension(["a", "b"], ["a", "b", "c"], { strict: true })).toBe(true);
    expect(isPrefixExtension(["a", "b"], ["a", "b"], { strict: true })).toBe(false);
  });

  it("returns true for a true prefix extension", () => {
    expect(isPrefixExtension(["a", "b"], ["a", "b", "c", "d"])).toBe(true);
    expect(isPrefixExtension(["a", "b"], ["a", "b", "c", "d"], { strict: true })).toBe(true);
  });

  it("returns false when the prefix diverges", () => {
    expect(isPrefixExtension(["a", "b"], ["a", "x", "c"])).toBe(false);
    expect(isPrefixExtension(["a", "b"], ["a", "x", "c"], { strict: true })).toBe(false);
  });

  it("returns false when the new list is longer but the prefix diverges", () => {
    expect(isPrefixExtension(["a", "b"], ["x", "y", "z"])).toBe(false);
    expect(isPrefixExtension(["a", "b"], ["x", "y", "z"], { strict: true })).toBe(false);
  });

  it("returns false when the new list is shorter than the old list", () => {
    expect(isPrefixExtension(["a", "b", "c"], ["a"])).toBe(false);
    expect(isPrefixExtension(["a", "b", "c"], ["a"], { strict: true })).toBe(false);
  });
});
