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

| In-repo (host)                                                                                        | MF plugin (facade)                                                                                                                            |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `useQuery` from `@vue/apollo-composable` (`composables/useSalesReps.ts`)                              | `useQuery` from `@vc-frontend/core`                                                                                                           |
| `Logger` from `@/core/utilities` (`composables/useSalesReps.ts`)                                      | remove import; use `console.error`                                                                                                            |
| `MenuType` from `@/core/types` (`menu.ts`)                                                            | `MenuType` from `@vc-frontend/core`                                                                                                           |
| Vc components **not imported** in `pages/sales-reps.vue` (globally registered by the host)            | re-add `import { VcButton, VcEmptyView, VcInput, VcTable, VcTypography, VcWidget } from "@vc-frontend/core";` — MF has no global registration |
| `useModuleSettings` from `@/core/composables/useModuleSettings` (`composables/useSalesRepsConfig.ts`) | `@vc-frontend/core`                                                                                                                           |

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

- `composables/useSalesReps.test.ts`: change `vi.mock("@vue/apollo-composable", …)` back to
  `vi.mock("@vc-frontend/core", …)`.
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
