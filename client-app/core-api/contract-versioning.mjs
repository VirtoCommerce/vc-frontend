/**
 * Pure decision logic for contract versioning. Must stay side-effect-free (no
 * filesystem/git — callers supply the facts) and separate from build-types.mjs:
 * that script executes its pipeline on import, so tests can only import THIS module.
 */

/**
 * Collects PUBLIC exported names from `export { ... }` statements of a rolled-up .d.ts.
 * For `export { _default$2 as VcButton }` the public name is the right-hand one -
 * internal rollup aliases mean nothing to plugin authors.
 *
 * ASSUMPTION: rollup-plugin-dts consolidates the whole surface into trailing
 * `export { ... }` / `export type { ... }` blocks (verified against the current
 * contract/index.d.ts). It does NOT match inline forms (`export declare const X`,
 * `export interface X`). If a future rollup/config change starts emitting inline
 * exports, a removed inline symbol would be invisible here and slip through as a
 * non-breaking minor — extend the matcher to cover those forms if that ever happens.
 */
export function extractExportNames(declarations) {
  // Match both `export { ... }` (values) and `export type { ... }` (type-only) blocks.
  // The rolled-up .d.ts emits type exports as their own whole-line `export type { I18n };`
  // block, so a value-only pattern would leave every public type invisible to the
  // breaking-change guard below (a removed type would ship as a non-breaking minor).
  const names = [...declarations.matchAll(/^export (?:type )?\{([^}]*)\}/gm)].flatMap((match) =>
    match[1].split(",").map((entry) => {
      const cleaned = entry.trim().replace(/^type /, "");
      // Index-based "as" split (Sonar S8786: a \s+as\s+ regex backtracks super-linearly).
      const aliasIndex = cleaned.lastIndexOf(" as ");
      return aliasIndex === -1 ? cleaned : cleaned.slice(aliasIndex + 4).trim();
    }),
  );
  return new Set(names.filter(Boolean));
}

/** Major component of a semver string ("1.2.0" -> 1). NaN for unparseable input. */
function majorOf(version) {
  return Number.parseInt(version, 10);
}

/** Minor component of a semver string ("1.2.0" -> 2). NaN for unparseable input. */
function minorOf(version) {
  return Number.parseInt(String(version).split(".")[1], 10);
}

/**
 * Which semver component carries which meaning, for the release line `version` sits on.
 *
 * Pre-1.0 the contract promises nothing, so both levels shift down one: an additive change
 * ships as a PATCH (a plugin pinned to `^0.1.0` keeps resolving it) and a breaking change as a
 * MINOR (which `^0.1.0` correctly refuses). From 1.0.0 the ordinary semver mapping applies.
 *
 * An unparseable version yields NaN, which is never === 0, so it lands on the 1.x policy and
 * the stricter MAJOR gate — the fail-closed behaviour the removal guard depends on.
 */
function policyFor(version) {
  return majorOf(version) === 0
    ? { additive: "patch", breaking: "minor", breakingComponentOf: minorOf }
    : { additive: "minor", breaking: "major", breakingComponentOf: majorOf };
}

/**
 * The versioning policy in one place:
 * - contract unchanged -> nothing to do;
 * - changed with exports REMOVED -> provably breaking: satisfied only by a MAJOR bump,
 *   otherwise a human must run `yarn bump:core major`;
 * - changed additively but version already bumped -> nothing to do;
 * - changed additively with the version untouched -> safe to apply automatically.
 * Which component each level maps to depends on the release line — see policyFor().
 * Returns { action: "none" | "bump-minor" | "bump-patch" | "require-major" | "require-minor", ... }.
 *
 * The breaking-change check comes BEFORE the "already bumped" short-circuit on purpose:
 * an earlier additive minor bump in the same release window must not mask a later
 * breaking removal, which would otherwise ship a major change under a minor version and
 * defeat the CONTRACT GATE.
 */
export function decideVersionAction({ changed, baseVersion, currentVersion, removedExports }) {
  if (!changed) {
    return { action: "none", reason: "contract unchanged" };
  }

  // The baseline decides which release line's rules apply: it is the version already published.
  const { breaking, breakingComponentOf } = policyFor(baseVersion);

  if (removedExports.length > 0) {
    // A removal is only acceptable once the breaking component has moved past the baseline;
    // a lesser bump (or no bump) is not enough. NaN comparisons fail closed here, so an
    // unparseable version still demands an explicit major bump.
    if (breakingComponentOf(currentVersion) > breakingComponentOf(baseVersion)) {
      return { action: "none", reason: `${breaking} already bumped` };
    }
    return { action: `require-${breaking}`, removedExports };
  }
  if (baseVersion !== currentVersion) {
    return { action: "none", reason: "version already bumped" };
  }
  return { action: `bump-${policyFor(currentVersion).additive}` };
}
