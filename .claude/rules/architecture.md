---
paths:
  - "**/*.vue"
  - "**/*.ts"
---

# Architecture

## Layers and import boundaries
Direction: `ui-kit` ← `core` ← `shared` ← `modules` / `pages`. dependency-cruiser runs in CI, but there is no rule for most of these directions — review by hand.

1. **No new upward imports**: ui-kit must not import `shared/`, `modules/`, `pages/` (and avoids new `@/core` imports — see `ui-kit.md` §14); `core/` and `shared/` must not import `modules/` or `pages/`. A module surfaces in the host through its `init()` and the extension registry, never through host imports of module code.
2. **Host → `modules/sales-rep` and `modules/returns` only via their `index.ts`** (`no-host-to-sales-rep-internals`, `no-host-to-returns-internals`). dependency-cruiser doesn't see `import type`, and the ESLint copy covers sales-rep only — a deep `import type` into returns is not caught by anything; flag it.
3. **Modules never import a host `_internal/` folder** (`no-module-to-host-internal`). The two `push-messages/link-push-messages*.vue` exemptions are frozen — don't add more; add an extension point.
4. **No module-to-module imports.** Shared logic goes to `shared/` or `core/`. (`purchase-requests` → `quotes` is legacy.)
5. Federated plugins import host APIs only from `@vc-frontend/core` (`client-app/core-api/index.ts`), never `@/...`. Adding to the facade = regenerate `contract/index.d.ts` with `yarn build:core-types` and commit; never edit it by hand; breaking change → `yarn bump:core`.
6. No devDependency imports in shipped `client-app` code, no packages missing from package.json, no imports from `*.test.ts`. New circular deps or orphans are findings.

## Module structure
Reference modules: `modules/returns`, `modules/sales-rep`.

7. Layout: `index.ts` (init only), `constants.ts`, `router.ts`/`routes.ts`, `menu.ts`, `api/graphql/{queries,mutations,fragments}/<name>/{<name>Query.graphql,index.ts}` + barrel + generated `types.ts`, `composables/`, `components/`, `pages/`, `locales/`.
8. `export function init(router, i18n)` is gated by `useModuleSettings(MODULE_ID).isEnabled(ENABLED_KEY)` (or a module helper like `isSalesRepsEnabled()`). Nothing — routes, menu, locales, extensions, cache policies — is registered outside the gate. `MODULE_ID` / `*_ENABLED_KEY` live in `constants.ts`, not inline strings.
9. A new module is wired in `app-runner.ts` with `void initX(router, i18n)` before `app.use(router)` (routes added later miss the initial navigation).
9a. Module-specific ids, settings keys and constants live in the module (`modules/<m>/constants.ts`), not in
    `core/constants` or `core/types/theme-config.ts` — a removable module must not leave pieces in core.
    (Exception: the shared `MODULE_ID_*` registry in `core/constants/modules.ts` used by host code.)
10. Module locales are loaded only with `loadModuleLocale(i18n, "<folder>")` — a hand-rolled `import("./locales/...")` breaks runtime locale switching.

## Routes, menus, permissions
11. Account routes nest under the named parent: `router.addRoute("Account", route)` with a relative `path`. Route names are constants (`ROUTES` or module constants), not repeated string literals.
12. Every route component is lazy: `component: () => import("./pages/x.vue")`. No eager page imports in routers.
13. Route `meta` keys must be declared in `client-app/vue-router.d.ts` (`layout`, `public`, `requiresAuth`, `requiresOrganization`, `hideLeftSidebar`, `hideRightSidebar`, `redirectable`). Anonymous pages need `public: true`; auth/error pages `redirectable: false`.
14. Menu items via `mergeMenuSchema(menuItems)` (`DeepPartial<MenuType>`): `id`, `route.name`, i18n-key `title`, `icon`, `priority`, and entries for both `header.desktop` and `header.mobile`. Account sidebar sections via `registerAccountSection`.
15. Permission-gated features check `useUser().checkPermissions(...)` (variadic AND) with `XApiPermissions` / module permission constants **everywhere**: route `beforeEnter` guard, nav link and widget. Hiding the link alone is a finding.

## Extension points
16. Module UI on host pages: `useExtensionRegistry().register(category, EXTENSION_NAMES.x.y, { component: defineAsyncComponent(() => import(...)) })`. Data-only: `registerContribution(..., { use })` — `use()` must be synchronous and must not throw.
17. A new extension point needs all three edits: `extensionRegistryMap.ts`, `initialExtensionRegistry.ts`, `extensionPointsNames.ts`.
18. Async components stored in reactive state are wrapped in `markRaw(defineAsyncComponent(...))`.
19. Module Apollo type policies via `registerCacheTypePolicies`, not edits to core `cache.ts`.

## Performance
20. Don't add `await`s on the boot path of `app-runner.ts`; start requests in parallel and attach a `.catch` immediately.
21. Graceful dynamic imports call `ignoreChunkLoadFailure(error)` before logging, otherwise chunk-load recovery reloads the page.

## Legacy — don't flag, don't copy
- `shared/catalog/components/product-card.vue`, `pages/product.vue`, `useCompareProductsPage.ts` → `@/modules/customer-reviews`; `vc-copy-text.vue` → `@/shared/notification`; ~21 `core` → `shared` imports.
- Root-level module composables (`quotes/useUserQuote.ts`), `initialize` instead of `init` (purchase-requests), inline routes/menus in `loyalty/index.ts`.
