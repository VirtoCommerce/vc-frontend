/**
 * `@vc-frontend/core` — the curated PUBLIC surface a Module Federation plugin may
 * import from the host. A facade: re-exports host code, nothing moves.
 * Publish-from-source: plugins consume TYPES only (compiled contract/index.d.ts); the
 * host provides the live instance at runtime via the MF shared singleton.
 * Keep it SMALL and additive — removing/renaming an export breaks every plugin.
 */

/**
 * Registers every `Vc*` component globally: `app.use(uiKit)`. A plugin's own dev server needs
 * this — the host's registrations only reach a remote that renders inside the host's app
 * instance. It is also the only way to render an exported component that resolves its own
 * children globally, as `OrderStatus` does with `VcChip` / `VcIcon` / `VcTooltip`.
 */
export { uiKit } from "@/ui-kit";

// Curated components for explicit imports, so a plugin can name what it uses.
export { VcWidget } from "@/ui-kit/components";
export {
  VcAlert,
  VcButton,
  VcEmptyView,
  VcInput,
  VcLoaderOverlay,
  VcMenuItem,
  VcSelect,
  VcTextarea,
  VcTypography,
} from "@/ui-kit/components/molecules";
export {
  VcBadge,
  VcBreadcrumbs,
  VcCheckbox,
  VcIcon,
  VcImage,
  VcLabel,
  VcLink,
  VcMarkdownRender,
} from "@/ui-kit/components/atoms";
export { VcModal, VcTable, VcTableColumn, VcWidgetSkeleton } from "@/ui-kit/components/organisms";

/**
 * Themed order-status chip. Its status -> colour/icon mapping comes from per-store
 * settings (`orders_statuses`), so a plugin that renders its own chip would show
 * different colours than the host for the same status. Props are contract: renaming
 * or removing one is a breaking change.
 */
export { default as OrderStatus } from "@/shared/account/components/order-status.vue";

// Extension registry — backed by @vueuse createGlobalState (hence @vueuse is shared).
export { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
// The registration keys the host matches against.
export { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";

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
export { useWishlistSharingScopes } from "@/shared/wishlists/composables/useWishlistSharingScopes";
// What the sharing modal hands a scope's `onSaved`, and the shape a scope's element must expose
// for the modal to read it.
export type {
  IWishlistSharingScopeControlsType,
  WishlistSharingScopeSavedContextType,
} from "@/shared/wishlists/composables/useWishlistSharingScopes";

export { Logger } from "@/core/utilities";
export { getProductRoute } from "@/core/utilities/product";
// A plugin's messages must re-merge on every locale switch, not just at init: the host re-runs
// every registered loader when the language changes. Merge with vue-i18n's own
// `mergeLocaleMessage` — the host has no seam of its own for that.
export { registerLocaleLoader } from "@/core/locale-loaders";
export type { LocaleLoaderType } from "@/core/locale-loaders";

export { globals } from "@/core/globals";
export type { I18n } from "@/i18n";
export type { ILanguage } from "@/core/types";
export type { ExtendedMenuLinkType, MenuType } from "@/core/types";

import { version } from "./package.json";
/** Contract version, single-sourced from core-api/package.json (managed by build:core-types / bump:core). */
export const CORE_VERSION: string = version;
