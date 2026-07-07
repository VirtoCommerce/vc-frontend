# VCST-5409 — My Sales Reps Contact Information (MF plugin + host facade extensions)

- **Ticket:** [VCST-5409](https://virtocommerce.atlassian.net/browse/VCST-5409) — [FE][Organization member] My Sales Reps Contact Information
- **Built on:** `feat/VCST-5159-mf-harness` (PR [#2365](https://github.com/VirtoCommerce/vc-frontend/pull/2365)), not yet merged
- **Related:** VCST-5293 (back-office "Sales Rep" role), VCST-4907 (clone source)
- **Date:** 2026-07-07

## User story

> As a Company member, I want to get actual contact information about all Sales Reps
> that support my organization, so that I can contact them if required.

### Acceptance criteria (from ticket)

1. A "Sales Rep" role exists in the back office (VCST-5293).
2. Frontend has a configuration: the Sales Rep role name.
3. If the setting is configured, the frontend shows a **"Sales reps"** section listing all
   Sales Reps assigned to organizations the current user is a member of.
4. The section is a list/table (same style as Company members) with search + filters, columns:
   **Name, Email, Phone**.
5. Only **active** accounts are shown (blocked/disabled/deleted are hidden from the store-front).
6. Sales Reps are **not** shown in the "Company members" list. *(Backend concern — out of FE scope.)*
7. Organization maintainers cannot add/remove/edit Sales Reps (the view is **read-only**).

**Explicitly out of scope:** Sales Rep assignment to a user of a multi-user organization;
real backend wiring; excluding reps from the Company members query (backend).

## Context / constraints

- The feature ships as a **standalone Module Federation plugin** — its own project outside
  the `vc-theme-b2b-vue` repo — not as an in-repo `client-app/modules/*` module. The in-repo
  `modules/news` is only the reference for a plugin's internal shape.
- The **backend (`vc-module-profile-experience-api`) is not ready**, so data and the module
  setting are **mocked**, structured for a one-file swap to real GraphQL later.
- Reuse the existing modularity flow (extension registry + `useNavigations` menu injection),
  not a parallel mechanism.

## What the harness already provides (verified)

- **Route registration:** `globals.router.addRoute(parentName, route)` — live `vue-router`
  via the `globals` facade export. Works today.
- **UI (runtime):** all `Vc*` ui-kit components are globally registered
  (`client-app/ui-kit/index.ts:15`), so at runtime a plugin template resolves `<VcTable>` etc.
  However, the plugin's own `vue-tsc` type-check has no knowledge of host globals — so the
  components the page uses (`VcTable`, `VcInput`, `VcEmptyView`; `VcWidget` already exported) must
  be **added to the facade** for typed imports. See H1.
- **Account shell:** both `/account` and `/company` render `<AccountShell />` (sidebar +
  `<router-view>`). Nesting a route under the `Company` parent yields the corporate sidebar
  layout **and** inherits its `meta: { requiresAuth, requiresOrganization }` guard.
- **Settings / i18n:** `useModuleSettings` (facade) for the config gate; `globals.i18n` for
  plugin locale messages.

### The one real gap

Adding a **new** account nav link is not supported additively today. The account nav renders
items from `useNavigations()` (the `menu.json` schema); the `accountMenu` extension category
only *overrides the rendering of an existing item by id* — it cannot add a row. In-repo modules
add links via `mergeMenuSchema(...)`, which is not on the facade yet.

## Decisions

| Decision | Choice |
|---|---|
| Nav-link injection | **Expose a narrow `extendMenuSchema(schema)` wrapper on the facade** (thin wrapper over `useNavigations().mergeMenuSchema`); plugin merges a Corporate menu item, like `loyalty`/`purchase-requests`. Chosen over re-exporting the whole `useNavigations` composable on API-hygiene grounds — see H1. |
| Plugin location | Own fresh git repo at `~/vc/vc-plugins/sales-rep-plugin`, scaffolded via `yarn create:plugin`. |
| Table interactivity | **Search + sort + pagination** over mock data; empty filter slot kept (member-style role/status facets aren't meaningful for single-role, active-only reps). |
| Scaffold tooling | ESLint + Prettier + EditorConfig/VSCode + Husky/lint-staged/commitlint, aligned with host. |
| Tooling delivery | **Part of this ticket** (not a separate PR). |

> **Open item (non-blocking):** AC#4 literally says "search + **filters**". We consciously ship
> search + sort + pagination only, since role/status facets don't map to single-role, active-only
> reps. Get ticket-owner sign-off on dropping facet filters, or the empty filter slot becomes a
> real facet later.

## Work streams

| Stream | Location | Branch |
|---|---|---|
| Host (facade + scaffold tooling) | `vc-theme-b2b-vue` | `feat/VCST-5409-sales-reps` off `feat/VCST-5159-mf-harness` |
| Plugin (the feature) | `~/vc/vc-plugins/sales-rep-plugin` | own fresh git repo |

Local co-dev links the two via **yalc** (`yarn core:yalc-push` from host → plugin), so facade
changes are testable before the harness PR merges.

## Host-repo changes (minimal & generic)

### H1 — Facade: menu-injection helper + typed UI components

Two additive changes to the facade (`client-app/core-api/index.ts`), verified to build a clean
contract together (`yarn build:core-types`: 1538 → 1764 lines, no surviving `@/…` refs):

**(i) UI components** the plugin page imports with types:

```ts
export { VcWidget, VcTable, VcInput, VcEmptyView } from "@/ui-kit/components";
```

`VcInput` transitively adds **`maska`** to the contract's external peer imports (alongside
`utility-types` from (ii)) — both must be scaffold type-peers (see H2).

**(ii) Menu-injection helper.** Add a thin host-side wrapper next to the composable, then
re-export **the wrapper** (not the whole composable):

```ts
// client-app/core/composables/extendMenuSchema.ts
import { useNavigations } from "@/core/composables/useNavigations";
import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";

/** Narrow facade helper for MF plugins: contribute additional menu items without
 *  exposing the whole useNavigations surface. Same live singleton at runtime. */
export function extendMenuSchema(schema: DeepPartial<MenuType>): void {
  useNavigations().mergeMenuSchema(schema);
}
```
```ts
// client-app/core-api/index.ts
export { extendMenuSchema } from "@/core/composables/extendMenuSchema";
```

Then `yarn build:core-types` regenerates `contract/index.d.ts` and auto-minor-bumps
`CORE_VERSION`. Commit the new composable + `index.ts` + regenerated `contract/` + `package.json`
together (CI enforces the contract is not stale). This is the entire facade surface change.

**Why the wrapper, not `export { useNavigations }`** — verified by running `yarn build:core-types`
both ways against this checkout:

- Contract size is a near-wash: full composable +48 lines (→1586), wrapper +24 lines (→1562).
  Both build cleanly; neither leaves a forbidden `@/…` reference. The "bloat / brittle build"
  worry does **not** materialize — size is not the reason.
- The real reason is **API hygiene**: `useNavigations`'s return object has ~20 members, several of
  which *mutate host nav state* (`fetchCatalogMenu`, `fetchFooterLinks`, `fetchPinnedLinks`,
  `setMatchingRouteName`, `markLinkTree`). Every one becomes a forever-promise to every plugin;
  removing one later is a major bump. The plugin needs exactly one function. The facade is
  additive, so if a future plugin genuinely needs more, adding it then is a cheap minor bump.
- **`utility-types` becomes a new external contract import either way** (it types
  `DeepPartial<MenuType>`). The scaffold must add `utility-types` as a **type-peer devDep**
  (types-only, no runtime singleton) — otherwise `DeepPartial<MenuType>` silently resolves to
  `any` under `skipLibCheck` (per `create-plugin.mjs`'s own type-peer warning). See H2.
- No `MF_SHARED_RANGES` change is needed: the plugin borrows `@vc-frontend/core` from the host's
  shared scope with `import: false`, so re-exported host code never introduces a new **runtime**
  singleton. The only fallout is type-level (the `utility-types` peer above).

### H2 — `create:plugin` scaffold tooling

Extend `client-app/core-api/create-plugin.mjs` to emit, for every scaffolded plugin, configs
trimmed/aligned to the host repo:

- `eslint.config.js` (+ `lint` script, eslint devDeps)
- `.prettierrc.json` + `.prettierignore` (+ `format` script, prettier devDep)
- `.editorconfig` + `.vscode/settings.json` (format-on-save)
- Husky + lint-staged + commitlint (pre-commit + commit-msg hooks; `"prepare": "husky"` — the
  host's `postinstall: yarn precheck && husky` does **not** transplant, plugins have no `precheck`)

Also, independent of the lint tooling: add **`utility-types`** and **`maska`** to the scaffold's
type-peer devDeps — the two new external imports the H1 facade additions introduce
(`DeepPartial<MenuType>` and `VcInput`'s mask types). Without them those facade types resolve to
`any` under `skipLibCheck`. Both are present in the host `package.json` (`utility-types ^3.11.0`,
`maska ^3.2.0`).

Constraints verified against the host:
- All named packages exist in the host `package.json` (eslint 9 flat, prettier, husky 9.1.7,
  lint-staged, `@commitlint/cli` + `config-conventional`), so `create-plugin.mjs`'s
  read-version-from-host step (which hard-exits on a missing package) is satisfied. Keep the
  **trimmed** eslint config's plugin list and the emitted devDeps in lockstep — the host config
  pulls in sonarjs/tailwind/storybook/a11y plugins the plugin should not inherit.
- Plugin `package.json` is `"type": "module"` — emit config files in ESM or `.cjs` accordingly
  (e.g. commitlint config as `.cjs`).
- The lint tooling currently added here is **unconditional**; add a `--no-lint` escape hatch (the
  generator is otherwise opt-in-group-driven) so a plugin can skip git hooks.

Update the scaffold test at **`client-app/modules/federated/create-plugin.test.ts`** (it spawns
the real script and asserts file existence + parseability) to cover the new files. This benefits
all future plugins, not just this one.

## The plugin — internal shape (mirrors `modules/news`)

```
sales-rep-plugin/
├── src/
│   ├── index.ts                    # init(): gate (once) → addRoute + extendMenuSchema + load locale
│   ├── pages/sales-reps.vue        # VcWidget > VcTable; search + sort + pagination
│   ├── composables/useSalesReps.ts # MOCK data now; swap to GraphQL later (stable interface)
│   ├── composables/useSalesRepsConfig.ts # plugin-local MOCK gate (role name); real setting = swap point
│   ├── api/                        # placeholder query shape (profile-experience-api)
│   ├── types/index.ts              # SalesRep { id, name, email, phone }
│   ├── constants.ts                # MODULE_ID, ROLE_NAME_KEY, route name/segment
│   └── locales/{en,...}.json
└── (eslint / prettier / editorconfig / husky configs from the enhanced scaffold)
```

### Registration flow (`src/index.ts`)

```ts
let registered = false;

export function init(): void {
  if (registered) return;                              // idempotent: loader re-inits on HMR;
  if (!isSalesRepsEnabled()) return;                   // extendMenuSchema/addRoute both non-idempotent
  registered = true;

  globals.router.addRoute("Company", salesRepsRoute);  // nested → account shell + requiresOrganization
  extendMenuSchema(menuSchema);                        // adds Corporate → "Sales rep" link
  loadPluginLocale(globals.i18n);                      // merges current locale + `en` fallback
}
```

- **Gate (`isSalesRepsEnabled` in `useSalesRepsConfig.ts`) — DO NOT use the host `isEnabled()`
  directly.** Verified: `useModuleSettings(MODULE_ID).isEnabled(key)` returns strictly
  `value === true` read from `themeContext.storeSettings.modules` (`useModuleSettings.ts:24`). With
  `vc-module-profile-experience-api` absent from the store (our premise), it returns **false**, so
  a raw `if (!isEnabled(...)) return` would kill the plugin at line 1 — no route, no link, ever.
  Instead the gate is a **plugin-local mock** returning `true` (the configured role name), with the
  real call — `getSettingValue(ROLE_NAME_KEY)` non-empty (AC#2 is a *role-name string*, not a
  boolean) — written as the commented one-line swap point.
- **Route:** path `/company/sales-reps`, name `SalesReps`, nested under `Company`. Inherits
  `requiresAuth` + `requiresOrganization` (merged into `to.meta` for nested routes; enforced by the
  global `beforeEach` in `router/index.ts`), so no custom guard and no `useUser` facade export.
- **Nav link:** injected into `header.desktop.corporate.children` **and**
  `header.mobile.corporate.children`; `id: "sales-reps"`, `icon: "user-group"`, `route:
  { name: "SalesReps" }`. Ordering: desktop corporate items carry no `priority` (sort key 0), so any
  positive value works; **mobile** Company members has `priority: 30`, so use **> 30** to land after
  it on mobile. Visibility rides on the existing `isCorporateMember` gate on the Corporate widget.
- **Locale:** merge messages in `init()` (the nav-link title is a translation key resolved at render
  time). Merge the **current** locale *and* the **`en` fallback** (mirroring
  `modules/utils.ts#loadModuleLocale`), or missing keys render raw when current ≠ en.
- **Idempotency:** `extendMenuSchema` concatenates arrays blindly and `router.addRoute` re-adds; the
  federated loader tolerates remote re-registration (HMR), so a module-level `registered` flag
  guards against duplicate links/routes.

### Data (mocked) — `useSalesReps()`

Returns a static array (~10–15) of `{ id, name, email, phone }`, all active, and exposes
`{ items, loading, keyword, sort, page, pages }` performing client-side search (name/email/phone)
+ sort + pagination. Deliberately the **same interface** a reactive Apollo composable would
expose, so the later swap to a real `profile-experience-api` query is one file. Only-active
filtering is baked into the mock (AC#5).

### Page UI — `pages/sales-reps.vue`

`VcWidget size="lg"` → `VcTable` with a computed `columns` (Name / Email / Phone, sortable),
`VcInput` search, `@header-click`/`@page-changed` wiring, `VcEmptyView` for empty/no-results —
trimmed from `pages/company/members.vue`. Components are **imported from `@vc-frontend/core`**
(H1) so the plugin type-checks; they still resolve to the host's global singletons at runtime.
Read-only: no row actions, no CRUD (AC#7). Empty filter slot retained for future facets.

## Verification

Run the host with the plugin yalc-linked, `APP_MODULES_FEDERATION_ENABLED=true`, and the remote
pointed at the plugin's dev server. Confirm:

1. As an org member: "Sales rep" appears under Corporate, after Company members.
2. Clicking it loads the table inside the account shell (sidebar visible).
3. Search, column sort, and pagination work against the mock data.
4. A non-organization user hitting `/company/sales-reps` directly is redirected (inherited guard).
5. Only active reps are listed.
6. `yarn build:core-types` produces no contract drift in CI; the federated `create-plugin.test.ts`
   passes with the new tooling files.
7. Idempotency: forcing a plugin re-`init()` (HMR) does **not** duplicate the nav link or route.

## Risks / to-verify during implementation

- **Timing is best-effort, not absolute.** The host awaits federated loading before
  `app.use(router)`, but `startFederatedModules()` has a ~20s boot backstop that lets boot continue
  if a remote stalls — in which case route registration lands late. Normal path is fine (route
  ready before first navigation); just don't rely on strict ordering.
- **Contract-build graph growth (watch, don't assume).** `useNavigations` transitively pulls the
  GraphQL barrel, `useWhiteLabeling`, `useCurrency`, `menu.json`, core utilities; `build:core-types`
  fails on any diagnostic reachable from the facade. Run it first thing and eyeball the contract
  diff — the H1 wrapper keeps the *exported* surface to one function but the emit still walks the
  reachable graph. (Verified building cleanly on this checkout; re-check after rebasing on harness.)
- Confirm `VcTable`/`VcWidget`/`VcInput`/`VcEmptyView` resolve at runtime inside a federated
  plugin's rendered templates (expected: yes — shared Vue singleton + host global registration).
- `create-plugin.mjs` devDep versions are read from the host `package.json` (hard-exits on a
  missing package); all named tooling packages + `utility-types` are present today — keep it so.
