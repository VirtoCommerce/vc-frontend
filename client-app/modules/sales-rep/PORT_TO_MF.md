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

| In-repo (host)                                                                                                                                                        | MF plugin (facade)                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useQuery` / `useMutation` from `@vue/apollo-composable` (`useSalesRepHubQuery.ts` and the mutations) | **unchanged** — a federation shared singleton (`core-api/federation.mjs`), not a facade export |
| `Logger` from `@/core/utilities` and `globals` from `@/core/globals` (13 files each)                                                                                  | same names from `@vc-frontend/core`                                                                                                                                                                                                                                                                                    |
| `registerCacheTypePolicies` (`index.ts`) | `@vc-frontend/core` |
| `SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT` (`useSalesRepHubQuery.ts`, `useSalesRepCommunication.ts`) | `@vc-frontend/core` — added to the facade for this port. Every hub read runs through `useSalesRepHubQuery`, so this one import carries the whole module |
| `toStartDateFilterValue` / `toEndDateFilterValue` (`pages/customer-orders.vue`, VCST-5733) | `@vc-frontend/core` — added for this port |
| Direct ui-kit subpath imports — `VcWidget`, `VcButton`, `VcInput`, `VcCheckbox`, `VcWidgetSkeleton`, and the `@/ui-kit/components` barrel | `@vc-frontend/core`, all by name |
| `useExtensionRegistry` and `EXTENSION_NAMES` (`index.ts`)                                                                                                             | `@vc-frontend/core`                                                                                                                                                                                                                                                                                                    |
| `useWishlistSharingScopes` (`index.ts`) and `WishlistSharingScopeSavedContextType` (`components/wishlist-customer-sharing.vue`)                                       | `@vc-frontend/core`                                                                                                                                                                                                                                                                                                    |
| `useUser` (`index.ts`, `routes.ts`, `composables/useSalesRepsConfig.ts`), `useModuleSettings`, `useNavigations`                                                       | `@vc-frontend/core`                                                                                                                                                                                                                                                                                                    |
| `useModal` (2 files), `useNotifications` (2 files), `useBreadcrumbs` / `usePageHead` (`pages/customer-profile.vue`), `getProductRoute` (`components/top-sellers.vue`) | `@vc-frontend/core`                                                                                                                                                                                                                                                                                                    |
| `OrderStatus` (`components/sales-rep-orders.vue`) and `VcModal` (`components/customer-communication-modal.vue`)                                                       | `@vc-frontend/core`                                                                                                                                                                                                                                                                                                    |
| `MenuType` (`menu.ts`), `ExtendedMenuLinkType` (`components/link-my-customers.vue`)                                                                                   | `@vc-frontend/core`                                                                                                                                                                                                                                                                                                    |
| `I18n` (`index.ts`)                                                                                                                                                   | drops out with the param-less entry — §2                                                                                                                                                                                                                                                                               |
| Vc components used in templates but never imported                                                                                                                    | All 21 the module's templates reach for are facade exports. Global registrations still work when a remote renders inside the host's app instance; the explicit exports cover the plugin's own dev server, which has none                                                                                               |
| `IWishlistSharingScopeControlsType` — the shape a scope's element exposes for the host's modal to read                                                                | `@vc-frontend/core`                                                                                                                                                                                                                                                                                                    |
| `createWrapperFactory` from `@/core/utilities/tests` (4 specs)                                                                                                        | `@vc-frontend/core/testing` — ships as real source, since a plugin's specs run with no host to inject anything                                                                                                                                                                                                         |
| `cache` from `@/core/api/graphql/config/cache` (`data-freshness.test.ts`) | Not exported. The spec needs _an_ Apollo cache, not the host's instance, and the policies it exercises are the module's own: `new InMemoryCache({ typePolicies: layoutTypePolicies })` |
| `cache` + `errorHandlerLink` (`composables/error-notifications.test.ts`) | **Do not port this spec.** It assembles the host's link chain and mocks `@/shared/broadcast` to assert no toast fires — that is host behaviour, and neither piece is facade material. `useSalesRepHubQuery.test.ts` already pins that every hub read attaches the suppress context, which is the module's half of it |

## 2. Entry point — `index.ts`

The host calls `init(router, i18n)` and passes those in. The MF loader calls a param-less
entry and the module reads host singletons off `globals`. Rewrite `init` as:

- Drop the `(router, i18n)` parameters; read `globals.router` / `globals.i18n` from
  `@vc-frontend/core` instead.
- Re-add the **HMR idempotency guard** (`let registered = false; if (registered) return;`) —
  the MF loader re-invokes the entry on HMR, and `router.addRoute` / `extendMenuSchema` are
  not idempotent. (Dropped in-host because the host calls `init` exactly once.)
- **Keep** `useNavigations().mergeMenuSchema(salesRepMenuSchema)` — the facade exports
  `useNavigations`, not a standalone `extendMenuSchema` (an earlier revision of this guide said
  otherwise). `mergeMenuSchema` **concatenates** arrays, which is exactly why the guard above is
  not optional: a second call duplicates the menu link.
- Replace `void loadModuleLocale(i18n, "sales-rep")` with the plugin's own `loadLocale()`.
  `loadModuleLocale` lives in `client-app/modules/utils.ts` — **outside** the module, so copying
  the module folder does not bring it. Reproduce its two jobs: dynamically import
  `locales/<locale>.json` plus the `en` fallback, and merge each via `setLocaleMessage` onto a
  fresh object (never `mergeLocaleMessage` — it mutates in place and the host's base messages can
  be a frozen JSON-module namespace). Register it through the facade's `registerLocaleLoader` so
  the messages re-merge on a runtime locale switch, not only at init.
- Re-add `import "./styles.css";` at the top — MF injects the module's global CSS itself;
  in-host that file was dropped (it was comment-only; the real styling is scoped in the `.vue`).

## 3. Tests

- `composables/useSalesReps.test.ts`: the `vi.mock("@vue/apollo-composable", …)` stays — the
  plugin imports the composables from that package too (shared singleton, §1).
- Re-add `src/mocks/vc-frontend-core.ts` and the vitest alias that makes the (types-only)
  `@vc-frontend/core` specifier resolvable in tests.
- **The remap is not a rename inside `vi.mock`.** 17 specs mock host paths by string —
  `vi.mock("@/core/globals", …)`, `vi.mock("@/core/utilities", …)`, `vi.mock("@/shared/notification", …)`,
  `vi.mock("@/core/composables/useModuleSettings", …)` — and a `from "@/…"` sweep does not touch them.
  They must **collapse into ONE `vi.mock("@vc-frontend/core", …)` per file**, listing every facade
  symbol that file's subject imports: two `vi.mock` calls on the same specifier override each other,
  and a partial facade mock silently breaks every other facade import in that module graph.
  `vi.doMock` / `vi.doUnmock` inside a test body need the same rename (`utils.test.ts`).
- The MF-plumbing tests that were **not** ported (`index.test.ts`, `create-plugin.test.ts`,
  `federation-shared.test.ts`, `version-gate.test.ts`, `contract-versioning.test.ts`) live in
  the plugin repo / `client-app/modules/federated/` — restore from there, not from this module.

## 4. Standalone scaffolding (from the plugin repo, not the host)

The old plugin still exists as a **local-only** checkout at `vc-plugins/sales-rep-plugin` — no git
remote is configured, and no matching repository exists under the VirtoCommerce org, so publishing it
needs a home decided first. Its `main` stops at 2026-07-08, before the layout, statistics, dashboard
and filter work, which makes it a source of **scaffolding**, not of code: take its config and
`src/mocks/`, and copy the module's current source over the rest.

Restore the plugin repo's own config, which the host provides centrally and was therefore
dropped: `package.json`, `vite.config.ts` (federation `exposes`/shared), `codegen.ts`,
`tsconfig.json`, `eslint.config.js`, `.husky/`, `postcss.config.cjs`, `tailwind.config.cjs`,
`src/shims-vue.d.ts`, `index.html`.

**The old plugin `package.json` predates the saved-layout work** — it has no `sortablejs`
(+`@types/sortablejs`), which `components/layout-region.vue` imports directly, nor `@vueuse/core`
for `useBreakpoints` in `pages/customer-profile.vue`. Add both, and decide whether `sortablejs` is
bundled into the remote or listed as federation `shared`. `@vueuse/integrations` is _not_ needed —
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
settings and instead used a mock always-on gate. `useModuleSettings` **is** a facade export now, so this
file ports unchanged — no revert to the standalone plugin's mock gate.

## 7. GraphQL codegen registration

The in-repo module is registered in `scripts/graphql-codegen/generator.ts` (`independentModules`,
`name: "SalesRep"`, schema `/graphql/sales-rep`) so `api/graphql/types.ts` is reproducible via
`yarn generate:graphql-types`. The standalone plugin had its own `codegen.ts` pointing at the
same endpoint; when re-MF-ifying, restore that and remove the host generator entry.
