/**
 * `@vc-frontend/core` — the curated PUBLIC surface a Module Federation plugin may
 * import from the host. A facade: re-exports host code, nothing moves.
 * Publish-from-source: plugins consume TYPES only (compiled contract/index.d.ts); the
 * host provides the live instance at runtime via the MF shared singleton.
 * Keep it SMALL and additive — removing/renaming an export breaks every plugin.
 */

/**
 * Registers every `Vc*` component globally: `app.use(uiKit)`. Needed by any app instance that
 * renders `OrderStatus`, which resolves `VcChip` / `VcIcon` / `VcTooltip` globally.
 *
 * Inert until the package grows a runtime entry: the root export is types-only, so
 * `@vc-frontend/core` does not resolve at runtime outside the MF shared scope, and inside the
 * host `app.use(uiKit)` has already run at boot.
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
// `VcImage` needs the host too: its thumbnail logic reads the theme's `image_thumbnails_*`
// settings, and `useThemeContext`'s getter THROWS ("Theme context is missing.") until the host has
// set the context at boot. Only a filename-only `src` returns before that read — any URL `src`
// throws outside the host, so a plugin's own dev server or specs must stub it.
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
 * Themed order-status chip. Its status -> colour/icon mapping comes from the THEME's
 * `orders_statuses` (config/settings_data.json, reached as `themeContext.settings`) — not from
 * the store settings the backend returns, which land on `themeContext.storeSettings`. There is
 * no query that serves it, so a plugin rendering its own chip would drift from the host on a
 * theme it cannot read. Props are contract: renaming or removing one is a breaking change.
 *
 * Renders only inside the host: `useThemeContext`'s getter throws "Theme context is missing."
 * until `setThemeContext` has run, which happens at boot in `app-runner.ts`. That is also why
 * it cannot be rendered from a plugin's own process — a remote always runs inside the host,
 * and the root export is types-only outside the MF shared scope.
 */
export { default as OrderStatus } from "@/shared/account/components/order-status.vue";

// Extension registry — backed by @vueuse createGlobalState (hence @vueuse is shared).
export { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
// The registration keys the host matches against.
export { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";

// GraphQL / Apollo — same client, cache and auth link as the host.
export { apolloClient, graphqlClient } from "@/core/api/graphql/client";
export { registerCacheTypePolicies } from "@/core/api/graphql/config/registerCacheTypePolicies";
// Opts one operation out of the host's global error toast, for a read that names its own failure inline.
export { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";

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
// A date-only bound ("YYYY-MM-DD") to the instant a filter needs: local midnight, or the last
// millisecond of that day. A plugin filtering by date has to land on the host's boundaries, not its own.
export { toEndDateFilterValue, toStartDateFilterValue } from "@/core/utilities/date";
// A plugin's messages must re-merge on every locale switch, not just at init: the host re-runs
// every registered loader when the language changes. Merge the way the host does — read the
// existing messages and `setLocaleMessage(locale, merge({}, existing, yours))`; vue-i18n's
// `mergeLocaleMessage` mutates the stored object in place.
export { registerLocaleLoader } from "@/core/locale-loaders";
export type { LocaleLoaderType } from "@/core/locale-loaders";

// Host route names a plugin mounts its own routes under (`router.addRoute(ROUTES.COMPANY.NAME, …)`)
// or links to. Vue Router throws on an unknown parent, so these names are contract: without this
// export a plugin hard-codes "Company"/"Account" and a host rename breaks it with every gate green.
// Exporting the whole map is deliberate — it puts every route name a plugin could reach for under
// the contract, so a rename shows up as a contract diff (a minor on 0.x) instead of a silent break.
export { ROUTES } from "@/router/routes/constants";

export { globals } from "@/core/globals";
export type { I18n } from "@/i18n";
export type { ILanguage } from "@/core/types";
export type { ExtendedMenuLinkType, MenuType } from "@/core/types";

import { version } from "./package.json";
/** Contract version, single-sourced from core-api/package.json (managed by build:core-types / bump:core). */
export const CORE_VERSION: string = version;
