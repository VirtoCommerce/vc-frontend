import { describe, expect, it } from "vitest";
import {
  HOST_SHARED,
  MF_SHARED_RANGES,
  REMOTE_SHARED,
  createHostShared,
  createRemoteShared,
  isMfFlagEnabled,
} from "@/core-api/federation.mjs";

describe("federation shared-dep contract", () => {
  it("host and remote configs cover exactly the same packages", () => {
    expect(Object.keys(HOST_SHARED)).toEqual(Object.keys(MF_SHARED_RANGES));
    expect(Object.keys(REMOTE_SHARED)).toEqual(Object.keys(MF_SHARED_RANGES));
  });

  it("every shared dep is a strict singleton with a real version range", () => {
    for (const config of Object.values(HOST_SHARED)) {
      expect(config.singleton).toBe(true);
      // strict: MF must THROW on a range mismatch (the default only warns).
      expect(config.strictVersion).toBe(true);
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

describe("createHostShared / createRemoteShared overrides", () => {
  it("returns the defaults when called without overrides", () => {
    expect(createHostShared()).toEqual(HOST_SHARED);
    expect(createRemoteShared()).toEqual(REMOTE_SHARED);
  });

  it("overrides a single field of a default entry without losing the rest", () => {
    const shared = createRemoteShared({ vue: { requiredVersion: "^3.6.0" } });
    expect(shared.vue).toEqual({
      singleton: true,
      strictVersion: true,
      import: false,
      requiredVersion: "^3.6.0",
    });
  });

  it("adds a new package; remote-added packages are provided by the plugin (no import:false)", () => {
    const shared = createRemoteShared({ "my-chart-lib": { requiredVersion: "^5.0.0" } });
    expect(shared["my-chart-lib"]).toEqual({
      singleton: true,
      strictVersion: true,
      requiredVersion: "^5.0.0",
    });
  });

  it("removes a package with false", () => {
    const shared = createHostShared({ graphql: false });
    expect(shared).not.toHaveProperty("graphql");
    expect(Object.keys(shared)).toHaveLength(Object.keys(HOST_SHARED).length - 1);
  });

  it("does not mutate the exported defaults", () => {
    createRemoteShared({ vue: { requiredVersion: "^999.0.0" }, graphql: false });
    expect(REMOTE_SHARED.vue.requiredVersion).toBe(MF_SHARED_RANGES.vue);
    expect(REMOTE_SHARED).toHaveProperty("graphql");
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
