import { describe, expect, it } from "vitest";
import { checkHostCompatibility } from "./version-gate";

describe("checkHostCompatibility", () => {
  it("passes when the plugin declares no requirement", () => {
    expect(checkHostCompatibility("2.53.0", undefined).ok).toBe(true);
    expect(checkHostCompatibility("2.53.0", "").ok).toBe(true);
  });

  describe("bare version (normalized to same-major minimum)", () => {
    it("passes an exact match", () => {
      expect(checkHostCompatibility("2.53.0", "2.53.0").ok).toBe(true);
    });

    it("passes a newer host within the same major (additive facade change)", () => {
      expect(checkHostCompatibility("2.60.1", "2.53.0").ok).toBe(true);
    });

    it("fails a host older than required", () => {
      const result = checkHostCompatibility("2.53.0", "2.60.0");
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("host provides 2.53.0");
    });

    it("fails a host with a higher major (breaking facade change)", () => {
      expect(checkHostCompatibility("3.0.0", "2.53.0").ok).toBe(false);
    });

    it("passes a prerelease host that is within the range", () => {
      expect(checkHostCompatibility("2.54.0-alpha.1", "2.53.0").ok).toBe(true);
    });
  });

  describe("explicit semver ranges", () => {
    it("evaluates caret ranges", () => {
      expect(checkHostCompatibility("2.53.0", "^2.0.0").ok).toBe(true);
      expect(checkHostCompatibility("3.0.0", "^2.0.0").ok).toBe(false);
    });

    it("evaluates compound ranges", () => {
      expect(checkHostCompatibility("2.53.0", ">=2.50.0 <3").ok).toBe(true);
      expect(checkHostCompatibility("3.1.0", ">=2.50.0 <3").ok).toBe(false);
    });
  });

  describe("fail closed on unparseable input", () => {
    it.each(["not-a-version", "^bogus^", "latest", "2.53.0 || nonsense !!"])("rejects %j", (required) => {
      const result = checkHostCompatibility("2.53.0", required);
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("not a valid semver");
    });
  });
});
