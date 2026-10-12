---
paths:
  - "client-app/modules/**"
  - "client-app/router/**"
---

# Modules and routes

Import boundaries and extension points are in `architecture.md`.

## Module structure
Reference modules: `modules/returns`, `modules/sales-rep`.

1. Layout: `index.ts` (init only), `constants.ts`, `router.ts`/`routes.ts`, `menu.ts`, `api/graphql/{queries,mutations,fragments}/<name>/` (wrapper `index.ts` per operation except in sales-rep, see `data-graphql.md` §2) + generated `types.ts`, `composables/`, `components/`, `pages/`, `locales/`.
2. `export function init(router, i18n)` is gated by `useModuleSettings(MODULE_ID).isEnabled(ENABLED_KEY)` (or a module helper like `isSalesRepsEnabled()`). Nothing — routes, menu, locales, extensions, cache policies — is registered outside the gate. `MODULE_ID` / `*_ENABLED_KEY` live in `constants.ts`, not inline strings.
3. A new module is wired in `app-runner.ts` with `void initX(router, i18n)` before `app.use(router)` (routes added later miss the initial navigation).
4. Module-specific ids, settings keys and constants live in the module (`modules/<m>/constants.ts`), not in
   `core/constants` or `core/types/theme-config.ts` — a removable module must not leave pieces in core.
   (Exception: the shared `MODULE_ID_*` registry in `core/constants/modules.ts` used by host code.)
5. Module locales are loaded only with `loadModuleLocale(i18n, "<folder>")` — a hand-rolled `import("./locales/...")` breaks runtime locale switching.

## Routes, menus, permissions
6. Account routes nest under the named parent: `router.addRoute("Account", route)` with a relative `path`. Route names are constants (`ROUTES` or module constants), not repeated string literals.
7. Every route component is lazy: `component: () => import("./pages/x.vue")`. No eager page imports in routers.
8. Route `meta` keys must be declared in `client-app/vue-router.d.ts` (`layout`, `public`, `requiresAuth`, `requiresOrganization`, `hideLeftSidebar`, `hideRightSidebar`, `redirectable`). Anonymous pages need `public: true`; auth/error pages `redirectable: false`.
9. Menu items via `mergeMenuSchema(menuItems)` (`DeepPartial<MenuType>`): `id`, `route.name`, i18n-key `title`, `icon`, `priority`, and entries for both `header.desktop` and `header.mobile`. Account sidebar sections via `registerAccountSection`.
10. Permission-gated features check `useUser().checkPermissions(...)` (variadic AND) with `XApiPermissions` / module permission constants **everywhere**: route `beforeEnter` guard, nav link and widget. Hiding the link alone is a finding.

## Legacy — don't flag, don't copy
- Root-level module composables, `initialize` instead of `init`, inline routes/menus in a module's `index.ts`.
