/**
 * Pure decision logic for contract versioning, extracted from build-types.mjs so it
 * is unit-testable (the build script executes its pipeline on import and cannot be
 * imported by tests). No filesystem or git access here - callers supply the facts.
 */

/**
 * Collects PUBLIC exported names from `export { ... }` statements of a rolled-up .d.ts.
 * For `export { _default$2 as VcButton }` the public name is the right-hand one -
 * internal rollup aliases mean nothing to plugin authors.
 */
export function extractExportNames(declarations) {
  const names = [...declarations.matchAll(/^export \{([^}]*)\}/gm)].flatMap((match) =>
    match[1].split(",").map((entry) => {
      const parts = entry
        .trim()
        .replace(/^type /, "")
        .split(/\s+as\s+/);
      return parts[parts.length - 1];
    }),
  );
  return new Set(names.filter(Boolean));
}

/**
 * The versioning policy in one place:
 * - contract unchanged, or version already bumped -> nothing to do;
 * - changed with exports REMOVED -> provably breaking, a human must bump major;
 * - changed otherwise -> minor, safe to apply automatically.
 * Returns { action: "none" | "bump-minor" | "require-major", ... }.
 */
export function decideVersionAction({ changed, baseVersion, currentVersion, removedExports }) {
  if (!changed) {
    return { action: "none", reason: "contract unchanged" };
  }
  if (baseVersion !== currentVersion) {
    return { action: "none", reason: "version already bumped" };
  }
  if (removedExports.length > 0) {
    return { action: "require-major", removedExports };
  }
  return { action: "bump-minor" };
}
