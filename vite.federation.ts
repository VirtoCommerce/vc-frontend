import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { federation } from "@module-federation/vite";
import { createHostShared } from "./client-app/core-api/federation.mjs";
import type { PluginOption } from "vite";

/**
 * Build-side Module Federation HOST config.
 * Build-time tooling (imports the @module-federation/vite dev dep), so it lives at
 * build scope, not in client-app. The runtime loader lives in client-app/modules/federated.
 *
 * The shared-singleton contract itself (which packages, which version ranges) lives in
 * client-app/core-api/federation.mjs — the single source of truth that plugin builds
 * import too (as `@vc-frontend/core/federation`).
 */

const require = createRequire(import.meta.url);
const FACADE_PACKAGE = "@vc-frontend/core";
const coreApiVersion = (require("./client-app/core-api/package.json") as { version: string }).version;
const coreApiEntry = fileURLToPath(new URL("./client-app/core-api/index.ts", import.meta.url));
/** The theme's switch; the runtime reads the same key in client-app/modules/federated/enabled.ts. */
const themeEnablesFederation =
  (require("./client-app/config/settings_data.json") as { settings: { module_federation_enabled?: boolean } }).settings
    .module_federation_enabled !== false;

/**
 * Alias so the HOST resolves @vc-frontend/core to the real source entry (it provides
 * the live facade). Points at the file, not the package dir: the package `exports`
 * root is deliberately types-only, so package resolution must never be used for runtime.
 */
export function federatedAlias(rootDir: string): Record<string, string> {
  return { [FACADE_PACKAGE]: path.resolve(rootDir, "client-app/core-api/index.ts") };
}

/** MF host plugin(s) — empty when the theme sets `module_federation_enabled: false`. Spread into vite `plugins`. */
export function federatedHostPlugin(): PluginOption[] {
  if (!themeEnablesFederation) {
    return [];
  }
  // dts off — types come from `yarn build:core-types`, not the MF dts plugin.
  return [
    federation({
      name: "host",
      // Default `remoteEntry-[hash]`: nothing but this build loads the host's own entry, and an
      // unhashed .js sits in CDN caches for hours after a deploy, pointing at chunks that no longer
      // exist (qa1, 2026-09-11). Plugins keep an unhashed remoteEntry.js - the platform advertises it.
      manifest: true,
      dts: false,
      shareStrategy: "loaded-first",
      // The facade is not an installed package, and @module-federation/vite resolves
      // shared providers via Node resolution from the project root - Vite aliases do
      // NOT apply. Without the explicit `import` path the host would register an
      // EMPTY module as the facade provider; `version` is explicit for the same reason.
      shared: createHostShared({ [FACADE_PACKAGE]: { version: coreApiVersion, import: coreApiEntry } }),
    }) as PluginOption,
    keepFacadeOutOfOptimizeDeps(),
  ];
}

/**
 * On `serve`, @module-federation/vite force-includes every shared key in `optimizeDeps`, and its own
 * normalizer then drops from `exclude` whatever `include` holds — so a plain `optimizeDeps.exclude`
 * cannot opt out. The facade is not an installed package (it resolves to project source), so esbuild
 * would prebundle `core-api/index.ts` and everything it imports outside Vite's plugin pipeline:
 * `@rollup/plugin-graphql` never runs there and every `.graphql` import fails to load.
 * `enforce: "post"` puts this after their normalizer, which is where both lists can be put right.
 */
function keepFacadeOutOfOptimizeDeps(): PluginOption {
  return {
    name: "vc-frontend:facade-out-of-optimize-deps",
    apply: "serve",
    enforce: "post",
    configResolved(config) {
      const include = config.optimizeDeps.include ?? [];
      config.optimizeDeps.include = include.filter((dep) => dep !== FACADE_PACKAGE);

      const exclude = config.optimizeDeps.exclude ?? [];
      config.optimizeDeps.exclude = [...exclude.filter((dep) => dep !== FACADE_PACKAGE), FACADE_PACKAGE];
    },
  };
}
