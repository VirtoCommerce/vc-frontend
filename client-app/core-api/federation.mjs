/**
 * Single source of truth for the Module Federation shared-dependency contract.
 * Consumed by BOTH sides:
 * - the host build (vite.federation.ts) via createHostShared();
 * - plugin builds (node vite configs) via `@vc-frontend/core/federation` ->
 *   createRemoteFederationOptions() / createRemoteShared().
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
  "@vc-frontend/core": "^0.1.0",
};

/**
 * Packages the contract's TYPES reference that are not MF shared singletons. create-plugin
 * installs them; without them `skipLibCheck` silently degrades those facade types to `any`.
 *
 * Ranges are pinned here because several are transitive in the host (`@intlify/core-base`,
 * `@vue/shared`, `unhead`), so there is no host declaration to read. build-types.mjs checks
 * every pin against the INSTALLED version instead - the copy the contract is emitted from.
 */
export const CONTRACT_TYPE_PEERS = {
  "@floating-ui/vue": "^2.0.1",
  "@intlify/core-base": "^11.4.6",
  "@unhead/vue": "^3.2.1",
  "@vue/shared": "^3.5.40",
  maska: "^3.2.0",
  unhead: "^3.2.1",
  "utility-types": "^3.11.0",
};

// One place for the per-entry defaults: base packages (buildSharedConfig) and packages
// ADDED via overrides (mergeSharedConfig) must get identical semantics.
const SHARED_DEFAULTS = { singleton: true, strictVersion: true };

// SHARED-DEPENDENCY GATE - the second of the TWO version gates (see "The two version
// gates" in modules/federated/README.md). Guards INDIVIDUAL shared libraries: "does
// the host-provided vue/apollo/... satisfy the range this plugin was built against?"
// strictVersion is what makes it a gate: the MF runtime only WARNS on a singleton
// range mismatch by default; strict makes it throw at loadRemote() time, which the
// host loader converts into an isolated per-plugin failure. The facade API contract
// itself is guarded earlier by the CONTRACT GATE (modules/federated/version-gate.ts),
// before any plugin code runs.
function buildSharedConfig(extra) {
  return Object.fromEntries(
    Object.entries(MF_SHARED_RANGES).map(([name, requiredVersion]) => [
      name,
      { ...SHARED_DEFAULTS, requiredVersion, ...extra },
    ]),
  );
}

function mergeSharedConfig(base, overrides) {
  const merged = { ...base };
  for (const [name, override] of Object.entries(overrides)) {
    if (override === false) {
      delete merged[name];
      continue;
    }
    merged[name] = { ...SHARED_DEFAULTS, ...merged[name], ...override };
  }
  return merged;
}

/**
 * Shared config for the HOST build - it bundles and provides every shared dep.
 * `overrides` merges per package: tweak a field, add a package, or drop one with
 * `false`, without losing the defaults:
 *   createHostShared({ vue: { requiredVersion: "^3.6.0" } })
 *   createHostShared({ "my-lib": { requiredVersion: "^5.0.0" } })
 *   createHostShared({ graphql: false })
 */
export function createHostShared(overrides = {}) {
  return mergeSharedConfig(buildSharedConfig({}), overrides);
}

/**
 * Shared config for PLUGIN (remote) builds. Defaults carry `import: false`, which
 * prevents the remote from bundling multi-MB fallback copies (vue, apollo, ...) - it
 * relies entirely on the host to provide the singletons at runtime. Packages ADDED
 * via overrides do NOT get `import: false`: a plugin-specific shared lib is provided
 * by the plugin itself. Same override semantics as createHostShared.
 */
export function createRemoteShared(overrides = {}) {
  return mergeSharedConfig(buildSharedConfig({ import: false }), overrides);
}

/** The default host config - equivalent to createHostShared() with no overrides. */
export const HOST_SHARED = /* @__PURE__ */ createHostShared();

/** The default plugin config - equivalent to createRemoteShared() with no overrides. */
export const REMOTE_SHARED = /* @__PURE__ */ createRemoteShared();

/**
 * One-call federation() options for a PLUGIN build:
 *   federation(createRemoteFederationOptions({ name: "news", requiredHostVersion: "^0.1.0" }))
 * The harness owns the wiring conventions (expose key, manifest metadata, shared
 * singletons, entry filename), so plugins pick convention changes up by updating
 * their host checkout instead of hand-editing config. Pure data - deliberately
 * imports no build tooling, so consuming it never requires the host's node_modules.
 */
export function createRemoteFederationOptions({ name, requiredHostVersion, exposes, sharedOverrides }) {
  if (!name || !requiredHostVersion) {
    throw new Error("createRemoteFederationOptions: `name` and `requiredHostVersion` are required.");
  }
  return {
    name,
    filename: "remoteEntry.js",
    exposes: exposes ?? { "./plugin": "./src/index.ts" },
    shared: createRemoteShared(sharedOverrides ?? {}),
    // Same strategy as the host (vite.federation.ts). With the MF default
    // ("version-first") on the remote side, two plugins sharing the same extra package
    // at different versions could resolve a different provider than the host would -
    // and strictVersion turns that into a hard load failure. One strategy everywhere
    // keeps provider selection deterministic across dev and prod.
    shareStrategy: "loaded-first",
    // CONTRACT GATE input: the host refuses to run this plugin's code when its
    // facade version does not satisfy this range.
    manifest: {
      additionalData: (data) => {
        // `??=` so a build where MF hands us stats without a metaData object doesn't throw.
        data.stats.metaData ??= {};
        data.stats.metaData.requiredHostVersion = requiredHostVersion;
        return data.stats;
      },
    },
    // Types come from the committed contract (contract/index.d.ts), not MF codegen.
    dts: false,
  };
}

/**
 * Env-flag normalization shared by the vite config (node) and bootstrap (browser).
 * ALLOWLIST semantics: only an explicit affirmative ("true", "1", "yes", "on") enables
 * Module Federation — every other string ("false", "0", "off", "no", "disabled",
 * typos, ...) fails toward OFF. Enabling a code-loading feature is the dangerous
 * direction, so unrecognized values must never enable it.
 */
const ON_FLAG_VALUES = new Set(["true", "1", "yes", "on"]);

export function isMfFlagEnabled(value) {
  if (value === true) {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  return ON_FLAG_VALUES.has(value.trim().toLowerCase());
}
