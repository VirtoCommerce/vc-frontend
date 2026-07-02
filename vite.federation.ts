import path from "path";
import { federation } from "@module-federation/vite";
import type { PluginOption } from "vite";

/**
 * Build-side Module Federation HOST config (VCST-5159), split out of vite.config.ts.
 * Build-time tooling (imports the @module-federation/vite dev dep), so it lives at
 * build scope, not in client-app. The runtime loader lives in client-app/modules/federated.
 */

/**
 * Shared singletons — MINIMAL by design (#6): a package is here only if a second
 * instance breaks correctness (framework/router/i18n identity, @vueuse global state,
 * one Apollo+graphql, the live facade). `requiredVersion: "*"` defers to the loader's
 * version gate. Anything not required-single is left out and bundled per-plugin.
 */
export const MF_SHARED = {
  vue: { singleton: true, requiredVersion: "*" },
  "vue-router": { singleton: true, requiredVersion: "*" },
  "vue-i18n": { singleton: true, requiredVersion: "*" },
  "@vueuse/core": { singleton: true, requiredVersion: "*" },
  "@apollo/client": { singleton: true, requiredVersion: "*" },
  "@vue/apollo-composable": { singleton: true, requiredVersion: "*" },
  graphql: { singleton: true, requiredVersion: "*" },
  "@vc-frontend/core": { singleton: true, requiredVersion: "*", version: "2.53.0" },
} as const;

/** Alias so the host resolves @vc-frontend/core to real source (it provides the live facade). */
export function federatedAlias(rootDir: string): Record<string, string> {
  return { "@vc-frontend/core": path.resolve(rootDir, "client-app/core-api") };
}

/** MF host plugin(s) — empty when APP_MF_HOST is off. Spread into vite `plugins`. */
export function federatedHostPlugin(enabled: string | boolean | undefined): PluginOption[] {
  if (!enabled) {
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
      shared: MF_SHARED,
    }) as PluginOption,
  ];
}
