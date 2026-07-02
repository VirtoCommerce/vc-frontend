/**
 * `@vc-frontend/core` — the curated PUBLIC surface of the storefront host.
 *
 * This is the only contract a Module Federation plugin is allowed to import from
 * the host. It is a *facade*: it re-exports existing host code, nothing moves.
 *
 * Runtime model ("publish-from-source", see VCST-5159):
 *   - The HOST provides this module as an eager MF shared singleton — it resolves
 *     to real `@/` source and carries the live Vue app's router/i18n/apollo/state.
 *   - A PLUGIN installs this package for TYPES only and declares it shared with
 *     `import: false` + `requiredVersion: false`, so at runtime the plugin gets
 *     the host's running instance and never bundles a second copy.
 *
 * Keep this surface SMALL and additive. Removing/renaming an export is a breaking
 * change for every plugin; adding one is safe.
 */

// ── UI kit ────────────────────────────────────────────────────────────────────
// A curated set of the most-used components, for explicit imports. Every VC*
// component is ALSO globally registered by the host (via the uiKit install), so a
// plugin can use them in templates without importing — these named exports are for
// use in <script>/render contexts. (The uiKit install itself is intentionally NOT
// exposed: a plugin renders inside the host's app and never installs it.)
export { VcWidget } from "@/ui-kit/components";
export { VcButton } from "@/ui-kit/components/molecules";
export { VcMarkdownRender } from "@/ui-kit/components/atoms";

// ── Extension points ──────────────────────────────────────────────────────────
// The host↔plugin extension-registry mechanism. Backed by `@vueuse` createGlobalState,
// which is why `@vueuse/core` must be a shared singleton (see vite.config.ts).
export { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

// ── GraphQL / Apollo ──────────────────────────────────────────────────────────
// Same client instance => same cache & auth link as the host.
export { apolloClient, graphqlClient } from "@/core/api/graphql/client";

// ── Composables ─────────────────────────────────────────────────────────────
export { useModuleSettings } from "@/core/composables/useModuleSettings";

// ── Globals & contract version ────────────────────────────────────────────────
export { globals } from "@/core/globals";
export { CORE_VERSION } from "./version";

// ── Types ─────────────────────────────────────────────────────────────────────
export type { I18n } from "@/i18n";
