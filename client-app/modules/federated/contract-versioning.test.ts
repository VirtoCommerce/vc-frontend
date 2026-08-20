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

  it("reads whole-line `export type { ... }` blocks (the form the rolled-up .d.ts emits)", () => {
    const declarations = ["export { VcButton, apolloClient };", "export type { I18n, IThemeConfig };"].join("\n");
    expect(extractExportNames(declarations)).toEqual(new Set(["VcButton", "apolloClient", "I18n", "IThemeConfig"]));
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
  const base = { baseVersion: "1.4.0", currentVersion: "1.4.0", removedExports: [] as string[] };

  it("does nothing when the contract is unchanged", () => {
    expect(decideVersionAction({ ...base, changed: false })).toEqual({ action: "none", reason: "contract unchanged" });
  });

  it("does nothing when the version was already bumped", () => {
    expect(decideVersionAction({ ...base, changed: true, currentVersion: "1.5.0" })).toEqual({
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

  it("still requires a major bump when a removal follows an earlier additive minor bump", () => {
    // base 1.0.0 was auto-bumped to 1.1.0 for an additive change; a later removal in the
    // same release window must NOT be masked by that minor bump (regression guard).
    expect(
      decideVersionAction({
        changed: true,
        baseVersion: "1.0.0",
        currentVersion: "1.1.0",
        removedExports: ["VcButton"],
      }),
    ).toEqual({ action: "require-major", removedExports: ["VcButton"] });
  });

  it("accepts a removal once the MAJOR version has been bumped past the baseline", () => {
    expect(
      decideVersionAction({ ...base, changed: true, currentVersion: "3.0.0", removedExports: ["VcButton"] }),
    ).toEqual({ action: "none", reason: "major already bumped" });
  });

  describe("pre-1.0 release line", () => {
    const preRelease = { baseVersion: "0.1.0", currentVersion: "0.1.0", removedExports: [] as string[] };

    it("auto-bumps patch for an additive change, so a caret range keeps resolving", () => {
      expect(decideVersionAction({ ...preRelease, changed: true })).toEqual({ action: "bump-patch" });
    });

    it("requires only a minor bump for a removal, which a caret range already refuses", () => {
      expect(decideVersionAction({ ...preRelease, changed: true, removedExports: ["VcButton"] })).toEqual({
        action: "require-minor",
        removedExports: ["VcButton"],
      });
    });

    it("still requires the breaking bump when a removal follows an earlier additive patch bump", () => {
      expect(
        decideVersionAction({
          changed: true,
          baseVersion: "0.1.0",
          currentVersion: "0.1.1",
          removedExports: ["VcButton"],
        }),
      ).toEqual({ action: "require-minor", removedExports: ["VcButton"] });
    });

    it("accepts a removal once the MINOR version has been bumped past the baseline", () => {
      expect(
        decideVersionAction({ ...preRelease, changed: true, currentVersion: "0.2.0", removedExports: ["VcButton"] }),
      ).toEqual({ action: "none", reason: "minor already bumped" });
    });

    it("accepts a removal carried by the promotion out of the pre-1.0 line", () => {
      expect(
        decideVersionAction({
          changed: true,
          baseVersion: "0.9.0",
          currentVersion: "1.0.0",
          removedExports: ["VcButton"],
        }),
      ).toEqual({ action: "none", reason: "minor already bumped" });
    });
  });

  it("fails closed (requires major) on a removal when a version string is unparseable", () => {
    // majorOf() yields NaN for a malformed version; the NaN comparison must resolve to
    // require-major, never silently allow the breaking removal through.
    expect(
      decideVersionAction({
        changed: true,
        baseVersion: "not-a-version",
        currentVersion: "2.0.0",
        removedExports: ["VcButton"],
      }),
    ).toEqual({ action: "require-major", removedExports: ["VcButton"] });
  });
});
