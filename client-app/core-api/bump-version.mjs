/**
 * Bumps the @vc-frontend/core CONTRACT version in its single source of truth,
 * core-api/package.json (the runtime CORE_VERSION imports it). Minor bumps happen
 * automatically inside `yarn build:core-types`; run this directly only for a
 * BREAKING change:
 *   yarn bump:core major
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
  if (level === "major") {
    console.log('[bump:core] MAJOR bump: also update the "@vc-frontend/core" range in federation.mjs.');
  }
  console.log("[bump:core] next: yarn build:core-types, then commit the changed files together.");
}
