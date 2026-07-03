/**
 * Bumps the @vc-frontend/core CONTRACT version in the two places that must stay in
 * sync (package.json + version.ts) so nobody has to edit them by hand.
 * Usage: yarn bump:core <major|minor|patch>
 * This version tracks facade changes only - it is independent of the host app
 * version that release automation bumps in the root package.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inc } from "semver";

const level = process.argv[2];
if (!["major", "minor", "patch"].includes(level ?? "")) {
  console.error("Usage: yarn bump:core <major|minor|patch>");
  process.exit(1);
}

const CORE_API_DIR = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(CORE_API_DIR, "package.json");
const versionTsPath = resolve(CORE_API_DIR, "version.ts");

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const current = pkg.version;
const next = inc(current, level);
if (!next) {
  console.error(`[bump:core] cannot bump "${current}" (${level}).`);
  process.exit(1);
}

pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
writeFileSync(
  versionTsPath,
  readFileSync(versionTsPath, "utf8").replace(/CORE_VERSION = "[^"]+"/, `CORE_VERSION = "${next}"`),
);

console.log(`[bump:core] ${current} -> ${next} (package.json + version.ts)`);
if (level === "major") {
  console.log('[bump:core] MAJOR bump: also update the "@vc-frontend/core" range in federation.mjs.');
}
console.log("[bump:core] next: yarn build:core-types, then commit the changed files together.");
