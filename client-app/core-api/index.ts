/**
 * `@vc-frontend/core` — the curated PUBLIC surface a Module Federation plugin may
 * import from the host. A facade: re-exports host code, nothing moves.
 * Publish-from-source: plugins consume TYPES only (compiled contract/index.d.ts); the
 * host provides the live instance at runtime via the MF shared singleton.
 * Keep it SMALL and additive — removing/renaming an export breaks every plugin.
 */

// UI kit — curated components for explicit imports (all VC* are also globally
// registered by the host, so plugins can use them in templates without importing).
export { VcWidget, VcTable, VcInput, VcEmptyView } from "@/ui-kit/components";
export { VcButton } from "@/ui-kit/components/molecules";
export { VcMarkdownRender } from "@/ui-kit/components/atoms";

// Extension registry — backed by @vueuse createGlobalState (hence @vueuse is shared).
export { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

// GraphQL / Apollo — same client, cache and auth link as the host.
export { apolloClient, graphqlClient } from "@/core/api/graphql/client";
// Reactive Apollo composables — re-exported so plugins execute the HOST's module
// instance and resolve the DefaultApolloClient provided app-wide in app-runner.
// A plugin must import these via the facade, never bundle its own copy.
export { useQuery, useLazyQuery, useMutation } from "@vue/apollo-composable";

export { useModuleSettings } from "@/core/composables/useModuleSettings";
export { extendMenuSchema } from "@/core/composables/extendMenuSchema";
export { globals } from "@/core/globals";
export type { I18n } from "@/i18n";
// Menu schema type for plugins contributing nav links: type an extendMenuSchema
// argument as `DeepPartial<MenuType>` (DeepPartial from the utility-types peer).
export type { MenuType } from "@/core/types/menu";

import { version } from "./package.json";
/** Contract version, single-sourced from core-api/package.json (managed by build:core-types / bump:core). */
export const CORE_VERSION: string = version;
