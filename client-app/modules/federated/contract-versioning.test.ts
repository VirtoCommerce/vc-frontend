import { describe, expect, it } from "vitest";
import { decideVersionAction, extractExportNames } from "@/core-api/contract-versioning.mjs";

describe("extractExportNames", () => {
  it("reads a single-line export statement", () => {
    expect(extractExportNames("export { VcButton, useModuleSettings };")).toEqual(
      new Set(["VcButton", "useModuleSettings"]),
    );
  });

  it("reads multi-line export statements", () => {
    const declarations = ["export {", "  apolloClient,", "  globals,", "};"].join("\n");
    expect(extractExportNames(declarations)).toEqual(new Set(["apolloClient", "globals"]));
  });

  it("keeps the PUBLIC name of aliased exports and unwraps type exports", () => {
    expect(extractExportNames("export { _default$2 as VcWidget, type I18n };")).toEqual(new Set(["VcWidget", "I18n"]));
  });

  it("ignores declarations that are not export statements", () => {
    const declarations = [
      "declare const VcButton: unknown;",
      'import { App } from "vue";',
      "export { VcButton };",
    ].join("\n");
    expect(extractExportNames(declarations)).toEqual(new Set(["VcButton"]));
  });

  it("returns an empty set for content without exports", () => {
    expect(extractExportNames("declare const x: number;")).toEqual(new Set());
  });
});

describe("decideVersionAction", () => {
  const base = { baseVersion: "2.53.0", currentVersion: "2.53.0", removedExports: [] as string[] };

  it("does nothing when the contract is unchanged", () => {
    expect(decideVersionAction({ ...base, changed: false })).toEqual({ action: "none", reason: "contract unchanged" });
  });

  it("does nothing when the version was already bumped", () => {
    expect(decideVersionAction({ ...base, changed: true, currentVersion: "2.54.0" })).toEqual({
      action: "none",
      reason: "version already bumped",
    });
  });

  it("auto-bumps minor for an additive change", () => {
    expect(decideVersionAction({ ...base, changed: true })).toEqual({ action: "bump-minor" });
  });

  it("requires a manual major bump when exports were removed", () => {
    expect(decideVersionAction({ ...base, changed: true, removedExports: ["VcButton"] })).toEqual({
      action: "require-major",
      removedExports: ["VcButton"],
    });
  });

  it("accepts an already-bumped version even when exports were removed", () => {
    expect(
      decideVersionAction({ ...base, changed: true, currentVersion: "3.0.0", removedExports: ["VcButton"] }),
    ).toEqual({ action: "none", reason: "version already bumped" });
  });
});
