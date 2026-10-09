/**
 * Bumps the @vc-frontend/core CONTRACT version in its single source of truth,
 * core-api/package.json (the runtime CORE_VERSION imports it). Additive bumps happen
 * automatically inside `yarn build:core-types`; run this directly only for a BREAKING
 * change, with the level that release line uses - `minor` on 0.x, `major` from 1.0.0:
 *   yarn bump:core minor
 * This version tracks facade changes only - it is independent of the host app
 * version that release automation bumps in the root package.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inc } from "semver";

const CORE_API_DIR = dirname(fileURLToPath(import.meta.url));

export function bumpContractVersion(level) {
  const pkgPath = resolve(CORE_API_DIR, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const current = pkg.version;
  const next = inc(current, level);
  if (!next) {
    throw new Error(`cannot bump "${current}" (${level}).`);
  }
  pkg.version = next;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  return { current, next };
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const level = process.argv[2];
  if (!["major", "minor", "patch"].includes(level ?? "")) {
    console.error("Usage: yarn bump:core <major|minor|patch>");
    process.exit(1);
  }
  const { current, next } = bumpContractVersion(level);
  console.log(`[bump:core] ${current} -> ${next} (core-api/package.json)`);
  // A caret range is pinned by the leftmost non-zero component: on 0.x a MINOR invalidates it.
  if (level === "major" || (level === "minor" && current.startsWith("0."))) {
    console.log(`[bump:core] breaking bump: also update the "@vc-frontend/core" range in federation.mjs to ^${next}.`);
  }
  console.log("[bump:core] next: yarn build:core-types, then commit the changed files together.");
}
