import { createRequire } from "node:module";
import path from "node:path";
import { federation } from "@module-federation/vite";
import { createHostShared, isMfFlagEnabled } from "./client-app/core-api/federation.mjs";
import type { PluginOption } from "vite";

/**
 * Build-side Module Federation HOST config (VCST-5159), split out of vite.config.ts.
 * Build-time tooling (imports the @module-federation/vite dev dep), so it lives at
 * build scope, not in client-app. The runtime loader lives in client-app/modules/federated.
 *
 * The shared-singleton contract itself (which packages, which version ranges) lives in
 * client-app/core-api/federation.mjs — the single source of truth that plugin builds
 * import too (as `@vc-frontend/core/federation`).
 */

const require = createRequire(import.meta.url);
const coreApiVersion = (require("./client-app/core-api/package.json") as { version: string }).version;

/**
 * Alias so the HOST resolves @vc-frontend/core to the real source entry (it provides
 * the live facade). Points at the file, not the package dir: the package `exports`
 * root is deliberately types-only, so package resolution must never be used for runtime.
 */
export function federatedAlias(rootDir: string): Record<string, string> {
  return { "@vc-frontend/core": path.resolve(rootDir, "client-app/core-api/index.ts") };
}

/** MF host plugin(s) — empty when APP_MF_HOST is off. Spread into vite `plugins`. */
export function federatedHostPlugin(enabled: string | boolean | undefined): PluginOption[] {
  if (!isMfFlagEnabled(enabled)) {
    return [];
  }
  // dts off — types come from `yarn build:core-types`, not the MF dts plugin.
  return [
    federation({
      name: "host",
      filename: "remoteEntry.js",
      manifest: true,
      dts: false,
      shareStrategy: "loaded-first",
      // The facade is portal-linked source; give MF its concrete version explicitly.
      shared: createHostShared({ "@vc-frontend/core": { version: coreApiVersion } }),
    }) as PluginOption,
  ];
}
