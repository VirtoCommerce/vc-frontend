/**
 * Pure decision logic for contract versioning. Must stay side-effect-free (no
 * filesystem/git — callers supply the facts) and separate from build-types.mjs:
 * that script executes its pipeline on import, so tests can only import THIS module.
 */
import { diff, gt, satisfies, valid } from "semver";

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

/**
 * Has `currentVersion` left the range a consumer pinned to `^baseVersion` accepts, by going UP?
 * That is what "the breaking bump happened" means on every release line: `^1.2.0` refuses 2.0.0,
 * `^0.1.0` refuses 0.2.0, `^0.9.0` refuses 1.0.0. Fails closed on an unparseable version.
 *
 * The direction is load-bearing. Every version BELOW the baseline is also outside `^baseVersion`,
 * so without `gt` a REGRESSED number read as proof the bump had happened: 1.2.0 -> 1.1.0 with an
 * export removed returned "major already bumped" and the release went out with fewer exports than
 * the earlier version number. A regression is never evidence of anything.
 */
function escapesCaretRange(currentVersion, baseVersion) {
  if (!valid(currentVersion) || !valid(baseVersion)) {
    return false;
  }
  return gt(currentVersion, baseVersion) && !satisfies(currentVersion, `^${baseVersion}`);
}

/** A published line only ever moves forward. Unparseable input is left to the checks downstream. */
function regressed(currentVersion, baseVersion) {
  if (!valid(currentVersion) || !valid(baseVersion)) {
    return false;
  }
  return currentVersion !== baseVersion && !gt(currentVersion, baseVersion);
}

/**
 * Which semver component carries which meaning, for the release line `version` sits on.
 *
 * Pre-1.0 the contract promises nothing, so both levels shift down one: an additive change
 * ships as a PATCH (a plugin pinned to `^0.1.0` keeps resolving it) and a breaking change as a
 * MINOR (which `^0.1.0` correctly refuses). From 1.0.0 the ordinary semver mapping applies.
 *
 * This names the LEVEL a human is asked to bump; the gate itself is escapesCaretRange().
 * An unparseable major yields NaN, never === 0, so it names the stricter MAJOR.
 */
function policyFor(version) {
  return majorOf(version) === 0 ? { additive: "patch", breaking: "minor" } : { additive: "minor", breaking: "major" };
}

/**
 * The versioning policy in one place:
 * - contract unchanged -> nothing to do;
 * - changed with exports REMOVED -> provably breaking: satisfied only by a version that
 *   escapes `^baseVersion`, otherwise a human must run `yarn bump:core <breaking level>`;
 * - changed additively but version already bumped -> nothing to do;
 * - changed additively with the version untouched -> safe to apply automatically.
 * Which component each level maps to depends on the release line — see policyFor().
 * Returns { action: "none" | "bump-minor" | "bump-patch" | "require-major" | "require-minor"
 * | "require-forward-version", ... }.
 *
 * The breaking-change check comes BEFORE the "already bumped" short-circuit on purpose:
 * an earlier additive minor bump in the same release window must not mask a later
 * breaking removal, which would otherwise ship a major change under a minor version and
 * defeat the CONTRACT GATE.
 *
 * `released` says whether `baseVersion` is a PUBLISHED contract. It gates the regression check
 * only: before the first release nothing is installed anywhere, so deliberately resetting the line
 * (1.2.0 -> 0.1.0, which is what this facade did) is legitimate. Once a version is out, the line
 * only moves forward.
 */
export function decideVersionAction({ changed, baseVersion, currentVersion, removedExports, released = true }) {
  if (!changed) {
    return { action: "none", reason: "contract unchanged" };
  }

  if (released && regressed(currentVersion, baseVersion)) {
    return { action: "require-forward-version", baseVersion, currentVersion, removedExports };
  }

  // The baseline names the level a human is ASKED for: it is the version already published.
  const { breaking } = policyFor(baseVersion);

  if (removedExports.length > 0) {
    if (escapesCaretRange(currentVersion, baseVersion)) {
      // What the human actually DID, which is not always the level they were asked for: a bump out
      // of the 0.x line satisfies a `require-minor` by moving the major, so reporting `breaking`
      // here would call a 0.9.0 -> 1.0.0 release a minor.
      return { action: "none", reason: `${diff(baseVersion, currentVersion)} already bumped` };
    }
    return { action: `require-${breaking}`, removedExports };
  }
  if (baseVersion !== currentVersion) {
    return { action: "none", reason: "version already bumped" };
  }
  return { action: `bump-${policyFor(currentVersion).additive}` };
}
