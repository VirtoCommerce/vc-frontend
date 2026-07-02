/**
 * `@vc-frontend/core` — the curated PUBLIC surface a Module Federation plugin may
 * import from the host (VCST-5159). A facade: re-exports host code, nothing moves.
 * Publish-from-source: plugins consume TYPES only (compiled dist/index.d.ts); the
 * host provides the live instance at runtime via the MF shared singleton.
 * Keep it SMALL and additive — removing/renaming an export breaks every plugin.
 */

// UI kit — curated components for explicit imports (all VC* are also globally
// registered by the host, so plugins can use them in templates without importing).
export { VcWidget } from "@/ui-kit/components";
export { VcButton } from "@/ui-kit/components/molecules";
export { VcMarkdownRender } from "@/ui-kit/components/atoms";

// Extension registry — backed by @vueuse createGlobalState (hence @vueuse is shared).
export { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

// GraphQL / Apollo — same client, cache and auth link as the host.
export { apolloClient, graphqlClient } from "@/core/api/graphql/client";

export { useModuleSettings } from "@/core/composables/useModuleSettings";
export { globals } from "@/core/globals";
export { CORE_VERSION } from "./version";
export type { I18n } from "@/i18n";
