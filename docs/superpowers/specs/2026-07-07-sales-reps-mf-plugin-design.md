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
- **UI:** all `Vc*` ui-kit components are globally registered (`client-app/ui-kit/index.ts:15`),
  so a plugin template can use `<VcTable>`, `<VcWidget>`, `<VcInput>`, `<VcEmptyView>` with no import.
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
| Nav-link injection | **Expose `useNavigations` (→ `mergeMenuSchema`) on the facade**; plugin merges a Corporate menu item, like `loyalty`/`purchase-requests`. |
| Plugin location | Own fresh git repo at `~/vc/vc-plugins/sales-rep-plugin`, scaffolded via `yarn create:plugin`. |
| Table interactivity | **Search + sort + pagination** over mock data; empty filter slot kept (member-style role/status facets aren't meaningful for single-role, active-only reps). |
| Scaffold tooling | ESLint + Prettier + EditorConfig/VSCode + Husky/lint-staged/commitlint, aligned with host. |
| Tooling delivery | **Part of this ticket** (not a separate PR). |

## Work streams

| Stream | Location | Branch |
|---|---|---|
| Host (facade + scaffold tooling) | `vc-theme-b2b-vue` | `feat/VCST-5409-sales-reps` off `feat/VCST-5159-mf-harness` |
| Plugin (the feature) | `~/vc/vc-plugins/sales-rep-plugin` | own fresh git repo |

Local co-dev links the two via **yalc** (`yarn core:yalc-push` from host → plugin), so facade
changes are testable before the harness PR merges.

## Host-repo changes (minimal & generic)

### H1 — Facade: expose menu injection

Add one re-export to `client-app/core-api/index.ts`:

```ts
export { useNavigations } from "@/core/composables/useNavigations";
```

Then `yarn build:core-types` regenerates `contract/index.d.ts` and auto-minor-bumps
`CORE_VERSION`. Commit `index.ts` + regenerated `contract/` + `package.json` together (CI
enforces the contract is not stale). This is the entire facade surface change.

> `useNavigations` is a `createGlobalState` singleton; exposing the composable (rather than a
> bare `mergeMenuSchema`) matches how host code consumes it and lets the singleton stay shared.
> If it drags in a package that must be a singleton, add it to `MF_SHARED_RANGES` in
> `federation.mjs` (verify during implementation).

### H2 — `create:plugin` scaffold tooling

Extend `client-app/core-api/create-plugin.mjs` to emit, for every scaffolded plugin, configs
trimmed/aligned to the host repo:

- `eslint.config.js` (+ `lint` script, eslint devDeps)
- `.prettierrc.json` + `.prettierignore` (+ `format` script, prettier devDep)
- `.editorconfig` + `.vscode/settings.json` (format-on-save)
- Husky + lint-staged + commitlint (pre-commit + commit-msg hooks; `prepare` script + devDeps)

Update `create-plugin.test.ts` to assert the new files are generated. This benefits all future
plugins, not just this one.

## The plugin — internal shape (mirrors `modules/news`)

```
sales-rep-plugin/
├── src/
│   ├── index.ts                    # init(): gate → mergeMenuSchema + addRoute + load locale
│   ├── pages/sales-reps.vue        # VcWidget > VcTable; search + sort + pagination
│   ├── composables/useSalesReps.ts # MOCK data now; swap to GraphQL later (stable interface)
│   ├── api/                        # placeholder query shape (profile-experience-api)
│   ├── types/index.ts              # SalesRep { id, name, email, phone }
│   ├── constants.ts                # MODULE_ID, ENABLED_KEY, route name/segment
│   └── locales/{en,...}.json
└── (eslint / prettier / editorconfig / husky configs from the enhanced scaffold)
```

### Registration flow (`src/index.ts`)

```ts
export function init(): void {
  const { isEnabled } = useModuleSettings(MODULE_ID);
  if (!isEnabled(ENABLED_KEY)) return;                 // AC#2/#3: gated on the Sales Rep setting
  globals.router.addRoute("Company", salesRepsRoute);  // nested → account shell + requiresOrganization
  useNavigations().mergeMenuSchema(menuSchema);        // adds Corporate → "Sales rep" link
  globals.i18n.global.mergeLocaleMessage(/* plugin locales */);
}
```

- **Route:** path `/company/sales-reps`, name `SalesReps`, nested under `Company`. Inherits
  `requiresAuth` + `requiresOrganization`, so no custom guard and no `useUser` facade export.
- **Nav link:** injected into `header.desktop.corporate.children` **and**
  `header.mobile.corporate.children`; `id: "sales-reps"`, `icon: "user-group"`, `route:
  { name: "SalesReps" }`, `priority` placing it right after Company members. Visibility rides on
  the existing `isCorporateMember` gate on the Corporate widget.
- **Gate default:** the backend setting won't exist yet, so the mock defaults to **enabled** so
  the link/page appear in local runs, with a comment marking where the real gate takes over.

### Data (mocked) — `useSalesReps()`

Returns a static array (~10–15) of `{ id, name, email, phone }`, all active, and exposes
`{ items, loading, keyword, sort, page, pages }` performing client-side search (name/email/phone)
+ sort + pagination. Deliberately the **same interface** a reactive Apollo composable would
expose, so the later swap to a real `profile-experience-api` query is one file. Only-active
filtering is baked into the mock (AC#5).

### Page UI — `pages/sales-reps.vue`

`VcWidget size="lg"` → `VcTable` with a computed `columns` (Name / Email / Phone, sortable),
`VcInput` search, `@header-click`/`@page-changed` wiring, `VcEmptyView` for empty/no-results —
trimmed from `pages/company/members.vue`. Read-only: no row actions, no CRUD (AC#7). Empty
filter slot retained for future facets.

## Verification

Run the host with the plugin yalc-linked, `APP_MODULES_FEDERATION_ENABLED=true`, and the remote
pointed at the plugin's dev server. Confirm:

1. As an org member: "Sales rep" appears under Corporate, after Company members.
2. Clicking it loads the table inside the account shell (sidebar visible).
3. Search, column sort, and pagination work against the mock data.
4. A non-organization user hitting `/company/sales-reps` directly is redirected (inherited guard).
5. Only active reps are listed.
6. `yarn build:core-types` produces no contract drift in CI; `create-plugin.test.ts` passes with
   the new tooling files.

## Risks / to-verify during implementation

- Whether exposing `useNavigations` requires adding any newly-reachable package to
  `MF_SHARED_RANGES` (singleton safety).
- Confirm `VcTable` and friends resolve at runtime inside a federated plugin's rendered
  templates (expected: yes, shared Vue singleton + host global registration).
- `create-plugin.mjs` devDep versions are read from the host `package.json`; ensure the new
  tooling packages exist there (or pin sensible versions).
