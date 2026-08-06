/**
 * `@vc-frontend/core` — the curated PUBLIC surface a Module Federation plugin may
 * import from the host. A facade: re-exports host code, nothing moves.
 * Publish-from-source: plugins consume TYPES only (compiled contract/index.d.ts); the
 * host provides the live instance at runtime via the MF shared singleton.
 * Keep it SMALL and additive — removing/renaming an export breaks every plugin.
 */

// UI kit — curated components for explicit imports (all VC* are also globally
// registered by the host, so plugins can use them in templates without importing).
export { VcWidget } from "@/ui-kit/components";
export { VcButton, VcInput } from "@/ui-kit/components/molecules";
export { VcCheckbox, VcMarkdownRender } from "@/ui-kit/components/atoms";
export { VcModal, VcWidgetSkeleton } from "@/ui-kit/components/organisms";

/**
 * Themed order-status chip. Its status -> colour/icon mapping comes from per-store
 * settings (`orders_statuses`), so a plugin that renders its own chip would show
 * different colours than the host for the same status. Props are contract: renaming
 * or removing one is a breaking change.
 */
export { default as OrderStatus } from "@/shared/account/components/order-status.vue";

// Extension registry — backed by @vueuse createGlobalState (hence @vueuse is shared).
export { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

// GraphQL / Apollo — same client, cache and auth link as the host.
export { apolloClient, graphqlClient } from "@/core/api/graphql/client";
export { registerCacheTypePolicies } from "@/core/api/graphql/config/registerCacheTypePolicies";

// Composables. Subpath imports, not barrels — a barrel re-exports the whole module
// graph and turns the contract's type graph (and Rollup's chunk graph) circular.
export { useModuleSettings } from "@/core/composables/useModuleSettings";
export { useNavigations } from "@/core/composables/useNavigations";
export { useBreadcrumbs } from "@/core/composables/useBreadcrumbs";
export { usePageHead } from "@/core/composables/usePageHead";
export { useUser } from "@/shared/account/composables/useUser";
export { useModal } from "@/shared/modal/composables/useModal";
export { useNotifications } from "@/shared/notification/composables/useNotifications";

export { Logger } from "@/core/utilities";
export { getProductRoute } from "@/core/utilities/product";
export { globals } from "@/core/globals";
export type { I18n } from "@/i18n";
export type { ExtendedMenuLinkType, MenuType } from "@/core/types";

import { version } from "./package.json";
/** Contract version, single-sourced from core-api/package.json (managed by build:core-types / bump:core). */
export const CORE_VERSION: string = version;
