import { describe, expect, it } from "vitest";
import { checkHostCompatibility } from "./version-gate";

// Versions use the FACADE contract scheme (CORE_VERSION, starts at 1.0.0 and is
// independent of the host app version) - not the theme's app version shape.
describe("checkHostCompatibility", () => {
  it("fails closed when the plugin declares no requirement", () => {
    const undefinedResult = checkHostCompatibility("1.4.0", undefined);
    expect(undefinedResult.ok).toBe(false);
    expect(undefinedResult.reason).toContain("no requiredHostVersion");
    expect(checkHostCompatibility("1.4.0", "").ok).toBe(false);
  });

  describe("bare version (normalized to same-major minimum)", () => {
    it("passes an exact match", () => {
      expect(checkHostCompatibility("1.4.0", "1.4.0").ok).toBe(true);
    });

    it("passes a newer host within the same major (additive facade change)", () => {
      expect(checkHostCompatibility("1.6.1", "1.4.0").ok).toBe(true);
    });

    it("fails a host older than required", () => {
      const result = checkHostCompatibility("1.4.0", "1.6.0");
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("host provides 1.4.0");
    });

    it("fails a host with a higher major (breaking facade change)", () => {
      expect(checkHostCompatibility("2.0.0", "1.4.0").ok).toBe(false);
    });

    it("passes a prerelease host that is within the range", () => {
      expect(checkHostCompatibility("1.5.0-alpha.1", "1.4.0").ok).toBe(true);
    });
  });

  describe("explicit semver ranges", () => {
    it("evaluates caret ranges", () => {
      expect(checkHostCompatibility("1.4.0", "^1.0.0").ok).toBe(true);
      expect(checkHostCompatibility("2.0.0", "^1.0.0").ok).toBe(false);
    });

    it("evaluates compound ranges", () => {
      expect(checkHostCompatibility("1.4.0", ">=1.2.0 <2").ok).toBe(true);
      expect(checkHostCompatibility("2.1.0", ">=1.2.0 <2").ok).toBe(false);
    });
  });

  describe("fail closed on unparseable input", () => {
    it.each(["not-a-version", "^bogus^", "latest", "1.4.0 || nonsense !!"])("rejects %j", (required) => {
      const result = checkHostCompatibility("1.4.0", required);
      expect(result.ok).toBe(false);
      expect(result.reason).toContain("not a valid semver");
    });
  });
});
