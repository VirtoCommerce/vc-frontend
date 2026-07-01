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
export { VcWidget } from "@/ui-kit/components";
export { VcMarkdownRender } from "@/ui-kit/components/atoms";

// ── Shared host pages ─────────────────────────────────────────────────────────
export { default as Error404 } from "@/pages/404.vue";

// ── Composables ─────────────────────────────────────────────────────────────
export { usePageTitle, useBreadcrumbs } from "@/core/composables";
export { useLanguages } from "@/core/composables/useLanguages";
export { useModuleSettings } from "@/core/composables/useModuleSettings";

// ── GraphQL / Apollo ──────────────────────────────────────────────────────────
// Same client instance => same cache & auth link as the host.
export { apolloClient, graphqlClient } from "@/core/api/graphql/client";

// ── Globals & constants ─────────────────────────────────────────────────────
export { globals } from "@/core/globals";
export { FALLBACK_LOCALE } from "@/core/constants";

// ── Types ─────────────────────────────────────────────────────────────────────
export type { I18n } from "@/i18n";
