import { describe, expect, it } from "vitest";
import { HOST_SHARED, MF_SHARED_RANGES, REMOTE_SHARED, isMfFlagEnabled } from "@/core-api/federation.mjs";

describe("federation shared-dep contract", () => {
  it("host and remote configs cover exactly the same packages", () => {
    expect(Object.keys(HOST_SHARED)).toEqual(Object.keys(MF_SHARED_RANGES));
    expect(Object.keys(REMOTE_SHARED)).toEqual(Object.keys(MF_SHARED_RANGES));
  });

  it("every shared dep is a singleton with a real version range", () => {
    for (const config of Object.values(HOST_SHARED)) {
      expect(config.singleton).toBe(true);
      expect(config.requiredVersion).not.toBe("*");
    }
  });

  it("remote config never bundles fallback copies", () => {
    for (const config of Object.values(REMOTE_SHARED)) {
      expect(config.import).toBe(false);
    }
    for (const config of Object.values(HOST_SHARED)) {
      expect(config).not.toHaveProperty("import");
    }
  });
});

describe("isMfFlagEnabled", () => {
  it.each([
    [undefined, false],
    ["", false],
    ["false", false],
    ["0", false],
    ["true", true],
    ["1", true],
    [true, true],
  ])("treats %j as %j", (value, expected) => {
    expect(isMfFlagEnabled(value)).toBe(expected);
  });
});
