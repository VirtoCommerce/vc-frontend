/**
 * Single source of truth for the Module Federation shared-dependency contract
 * (VCST-5159, review follow-up #4/#5). Consumed by BOTH sides:
 * - the host build (vite.federation.ts) via HOST_SHARED;
 * - plugin builds (node vite configs) via `@vc-frontend/core/federation` -> REMOTE_SHARED.
 * Mirrors vc-shell's @vc-shell/mf-config package. Plain .mjs with no node APIs so the
 * flag helper is also importable from browser code (bootstrap.ts).
 *
 * A package is listed only if a second copy breaks correctness (framework identity,
 * @vueuse global state, one Apollo cache + graphql, the live facade). Ranges must stay
 * compatible with the host package.json - build-types.mjs verifies this (drift guard).
 */

export const MF_SHARED_RANGES = {
  vue: "^3.5.0",
  "vue-router": "^4.6.0",
  "vue-i18n": "^11.4.0",
  "@vueuse/core": "^14.3.0",
  "@apollo/client": "^3.14.0",
  "@vue/apollo-composable": "^4.2.0",
  graphql: "^16.14.0",
  "@vc-frontend/core": "^1.0.0",
};

// strictVersion: the MF runtime only WARNS on a singleton range mismatch by default;
// strict makes it throw at loadRemote() time, which the host loader already converts
// into an isolated per-plugin failure - real fail-closed instead of a console warning.
function buildSharedConfig(extra) {
  return Object.fromEntries(
    Object.entries(MF_SHARED_RANGES).map(([name, requiredVersion]) => [
      name,
      { singleton: true, strictVersion: true, requiredVersion, ...extra },
    ]),
  );
}

/** Shared config for the HOST build - it bundles and provides every shared dep. */
export const HOST_SHARED = buildSharedConfig({});

/**
 * Shared config for PLUGIN (remote) builds. `import: false` prevents the remote from
 * bundling multi-MB fallback copies (vue, apollo, ...) - it relies entirely on the
 * host to provide the singletons at runtime.
 */
export const REMOTE_SHARED = buildSharedConfig({ import: false });

/**
 * Env-flag normalization shared by the vite config (node) and bootstrap (browser).
 * Env values are strings, so "false"/"0" must count as off, not truthy.
 */
export function isMfFlagEnabled(value) {
  return value === true || (typeof value === "string" && value !== "" && value !== "false" && value !== "0");
}
