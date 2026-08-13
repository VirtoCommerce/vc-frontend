# Porting `sales-rep` back to a Module Federation plugin

This module was migrated **from** a standalone MF plugin (`vc-plugins/sales-rep-plugin`)
**into** the host repo as a conventional in-repo module (VCST-5409). This document lists
exactly what to add/modify in the module's **code** to turn it back into an MF remote.

It is intentionally **code-only** — it does NOT cover deployment, hosting, remote
discovery, CSP, or the federation build/runtime plumbing (those live in
`client-app/modules/federated/` and the plugin repo's build config).

The migration was a facade→host **import remap** plus entry-point rewiring. Re-MF-ifying is
the same remap in reverse.

## 1. Import remap (host → `@vc-frontend/core` facade)

Every runtime host import the module makes is a facade export — the remap is mechanical.
Grep `from "@/` over the module rather than trusting the file lists below.

| In-repo (host) | MF plugin (facade) |
|---|---|
| `useQuery` / `useMutation` from `@vue/apollo-composable` (14 composables) | **unchanged** — a federation shared singleton (`core-api/federation.mjs`), not a facade export |
| `Logger` from `@/core/utilities` and `globals` from `@/core/globals` (13 files each) | same names from `@vc-frontend/core` |
| `apolloClient` (`composables/sharedSalesRepCustomersCount.ts`) and `registerCacheTypePolicies` (`index.ts`) | `@vc-frontend/core` |
| `useExtensionRegistry` and `EXTENSION_NAMES` (`index.ts`) | `@vc-frontend/core` |
| `useWishlistSharingScopes` (`index.ts`) and `WishlistSharingScopeSavedContextType` (`components/wishlist-customer-sharing.vue`) | `@vc-frontend/core` |
| `useUser` (`index.ts`, `routes.ts`, `composables/useSalesRepsConfig.ts`), `useModuleSettings`, `useNavigations` | `@vc-frontend/core` |
| `useModal` (2 files), `useNotifications` (2 files), `useBreadcrumbs` / `usePageHead` (`pages/customer-profile.vue`), `getProductRoute` (`components/top-sellers.vue`) | `@vc-frontend/core` |
| `OrderStatus` (`components/sales-rep-orders.vue`) and `VcModal` (`components/customer-communication-modal.vue`) | `@vc-frontend/core` |
| `MenuType` (`menu.ts`), `ExtendedMenuLinkType` (`components/link-my-customers.vue`) | `@vc-frontend/core` |
| `I18n` (`index.ts`) | drops out with the param-less entry — §2 |
| Vc components used in templates but never imported | Grep `<Vc`; the module's templates reach for ~21 of them and the facade exports 7 (`VcWidget VcButton VcInput VcCheckbox VcMarkdownRender VcModal VcWidgetSkeleton`). Whether a remote's templates resolve the host's global registrations depends on the remote rendering inside the host's app instance — verify that on the pilot before relying on it, and note the standalone dev server has no host registrations at all |
| `IWishlistSharingScopeControlsType` — the shape a scope's element exposes for the host's modal to read | `@vc-frontend/core` |
| Test-only: `createWrapperFactory` from `@/core/utilities/tests`, `cache` from `@/core/api/graphql/config/cache` | Test infrastructure, so not the runtime contract. Either publish it as a `@vc-frontend/core/testing` subpath export — the pattern `/federation` and `/tailwind-preset` already use — or let the plugin repo supply both: `createWrapperFactory` is generic VTU boilerplate, and `data-freshness.test.ts` needs *an* Apollo cache, not the host's instance. Decide before the module moves (§3) |

## 2. Entry point — `index.ts`

The host calls `init(router, i18n)` and passes those in. The MF loader calls a param-less
entry and the module reads host singletons off `globals`. Rewrite `init` as:

- Drop the `(router, i18n)` parameters; read `globals.router` / `globals.i18n` from
  `@vc-frontend/core` instead.
- Re-add the **HMR idempotency guard** (`let registered = false; if (registered) return;`) —
  the MF loader re-invokes the entry on HMR, and `router.addRoute` / `extendMenuSchema` are
  not idempotent. (Dropped in-host because the host calls `init` exactly once.)
- Replace `useNavigations().mergeMenuSchema(salesRepMenuSchema)` with
  `extendMenuSchema(salesRepMenuSchema)` from the facade.
- Replace `void loadModuleLocale(i18n, "sales-rep")` with the plugin's self-contained
  `loadLocale()` — it merges `locales/en.json` via `i18n.setLocaleMessage` onto a fresh
  object (never mutate the host's frozen locale namespace). See the plugin's original
  `index.ts` git history for the exact implementation.
- Re-add `import "./styles.css";` at the top — MF injects the module's global CSS itself;
  in-host that file was dropped (it was comment-only; the real styling is scoped in the `.vue`).

## 3. Tests

- `composables/useSalesReps.test.ts`: the `vi.mock("@vue/apollo-composable", …)` stays — the
  plugin imports the composables from that package too (shared singleton, §1).
- Re-add `src/mocks/vc-frontend-core.ts` and the vitest alias that makes the (types-only)
  `@vc-frontend/core` specifier resolvable in tests.
- The MF-plumbing tests that were **not** ported (`index.test.ts`, `create-plugin.test.ts`,
  `federation-shared.test.ts`, `version-gate.test.ts`, `contract-versioning.test.ts`) live in
  the plugin repo / `client-app/modules/federated/` — restore from there, not from this module.

## 4. Standalone scaffolding (from the plugin repo, not the host)

Restore the plugin repo's own config, which the host provides centrally and was therefore
dropped: `package.json`, `vite.config.ts` (federation `exposes`/shared), `codegen.ts`,
`tsconfig.json`, `eslint.config.js`, `.husky/`, `postcss.config.cjs`, `tailwind.config.cjs`,
`src/shims-vue.d.ts`, `index.html`.

**The old plugin `package.json` predates the saved-layout work** — it has no `sortablejs`
(+`@types/sortablejs`), which `components/layout-region.vue` imports directly, nor `@vueuse/core`
for `useBreakpoints` in `pages/customer-profile.vue`. Add both, and decide whether `sortablejs` is
bundled into the remote or listed as federation `shared`. `@vueuse/integrations` is *not* needed —
the layout used `useSortable` at one point and no longer does.

## 5. Cosmetic (host-lint-driven, optional to revert)

- View-model types were renamed to satisfy the host's `@typescript-eslint/naming-convention`
  `Type`-suffix rule: `SalesRep`→`SalesRepType`, `SalesRepSort`→`SalesRepSortType`,
  `SalesRepSortColumn`→`SalesRepSortColumnType` (`types/index.ts`, `useSalesReps.ts`,
  `pages/sales-reps.vue`). The plugin repo's lint didn't require this; revert only if its
  config differs.
- Locales: the host convention ships all 13 language files (populated from `en` via
  `yarn fix-locales`). The plugin shipped `en.json` only and self-merged it. Either is fine.

## 6. Enable gate

`composables/useSalesRepsConfig.ts` gates on the backend module's **storefront setting**:
`useModuleSettings("VirtoCommerce.SalesRep").isEnabled("SalesRep.Enabled")` (Boolean, default
false). When the module isn't installed the storefront gets no settings for it, so this
returns false. This differs from the standalone plugin, which could not read the host's
settings and instead used a mock always-on gate. In an MF world the remote has no direct
access to `useModuleSettings` either, so re-MF-ifying means reverting to a facade-provided
settings check (or the mock) — see the plugin's original `useSalesRepsConfig.ts`.

## 7. GraphQL codegen registration

The in-repo module is registered in `scripts/graphql-codegen/generator.ts` (`independentModules`,
`name: "SalesRep"`, schema `/graphql/sales-rep`) so `api/graphql/types.ts` is reproducible via
`yarn generate:graphql-types`. The standalone plugin had its own `codegen.ts` pointing at the
same endpoint; when re-MF-ifying, restore that and remove the host generator entry.
