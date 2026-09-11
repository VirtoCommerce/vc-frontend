# Federated Modules — TODO / open work

Tracking for **VCST-5159**. Backlog, except where a section says otherwise (#2 has shipped).
Decisions, rationale, and review analysis live in [`specs/`](./specs/)
(discovery/hosting/enablement: [`2026-07-06-discovery-hosting-decision.md`](./specs/2026-07-06-discovery-hosting-decision.md);
facade distribution: [`2026-07-06-facade-distribution-design.md`](./specs/2026-07-06-facade-distribution-design.md)).
Roughly in priority order.

---

## 0. Release 2.58.0 follow-ups (recorded 2026-09-11)

What the release-readiness pass found. Numbers were measured on `vcptcore-qa1` with theme build
`bb5f1147` and `VirtoCommerce.SalesRep` 3.1009.0-pr-13; items already tracked elsewhere in this
file are cross-referenced, not repeated.

**Before the theme release**

- [ ] **`/modules → platform` route on every environment that runs the theme.** Only `vcptcore-qa1`
      has it; `vcst-qa`, `vcst-dev`, `vcptcore-dev`, `vcptcore-qa` do not (checked 2026-09-11) —
      there the manifest 404s and Sales Rep Hub is silently absent. One `<TICKETS>-<env>-deployment`
      PR per env branch in vc-deploy-dev.
- [ ] **Release `vc-module-sales-rep` 3.1009.0** (un-draft #13). The marketplace's latest is
      3.1008.0, which carries no plugin: theme 2.58 + module ≤ 3.1008 = no Sales Rep Hub at all. The
      release runs through the shared `vc-build QuickRelease` workflow, which pins no Node while
      `module-ci` pins Node 24 — check that the runner built `StorefrontApp`, and `unzip -Z1` the
      zip: `plugins/vc-frontend/` must sit at the module root (the first PR artefact had it under
      `bin/`).
- [ ] **Release notes for 2.58.0.** MF is a preview. Version matrix: theme ≥ 2.58.0, SalesRep ≥
      3.1009.0, x-api ≥ 3.1020.0 (the module's own floor; `store.plugins` itself needs 3.1016.0),
      x-frontend ≥ 3.1005.0; Customer ≥ 3.1024.0 and ProfileExperienceApi ≥ 3.1018.0 come from the
      2.58 page context, not from MF. The `/modules` route. What happens when any of it is missing:
      the storefront boots, the hub is absent, nothing is logged in prod. The switch is build-time
      only. A module shipping `plugins/vc-frontend/` runs its code in every visitor's browser with
      the host's full privileges — install trusted modules only. Known limits: boot waits for the
      plugins, no prod telemetry, an externally hosted plugin needs a host rebuild plus CSP.
- [ ] **Module README, "Storefront plugin" section**: needs theme ≥ 2.58.0 and the route; how to see
      the plugin loaded (`mf-manifest.json` → 200 in the network tab); why the hub is missing
      (404 = no route, `skipped` = facade or shared-library version).
- [ ] **DevOps checklist for a new environment**: the `/modules` route; the storefront nginx must
      not cache 404s (Cloudflare kept one per `Accept-Encoding` variant for hours after a redeploy —
      the 2026-09-11 blank page); `Cache-Control` on `/modules/**` — next item.

**Soon after**

- [ ] **`Cache-Control` for `/modules/**`** (platform / x-frontend). The platform sends none, so
      Cloudflare answers `BYPASS` and browsers fall back to heuristic caching: `immutable` for the
      hashed `assets/*`, `no-cache` for `remoteEntry.js`, `mf-manifest.json`, `plugin.json`.
- [ ] **Boot cost with a plugin installed.** The sales-rep plugin declares no `permission` (it also
      serves buyer-facing widgets), so every visitor loads it before the router is installed:
      ~115 KB raw on the critical path, the manifest fetched twice (gate + runtime), about six
      sequential round trips to the platform on a cold cache — measured ≈ 150 ms warm and
      ≈ 1.5–2 s cold at ~350 ms RTT. The fixes are VCST-5761 (#1) and the fetch-hook seeding (#3).
      For the record: the MF host itself costs +159 KB gzip over an MF-off build of the same commit
      (+9 %), ≈ +67 KB gzip of it on the initial `index.html` payload.
- [ ] **Delete the in-repo `client-app/modules/sales-rep`** once QA signs the plugin off — the copy
      is dead code with double maintenance (`initSalesRep` is commented out in `app-runner.ts`; the
      bundle contains none of it). Take `PORT_TO_MF.md`, the `independentModules` entry in
      `scripts/graphql-codegen/generator.ts` and a `types.ts` regeneration with it.
- [ ] **E2E**: vc-testing-module has no Sales Rep Hub coverage at all — add a smoke (plugin loaded,
      hub menu visible for a rep) so the plugin path is not manual-only.
- [ ] **Port #2439 / #2444 into the plugin** once facade `0.1.1` (#2480) is released;
      `requiredHostVersion: "^0.1.1"`.
- [ ] **Module (backend owners)**: any SalesRep version crashes a platform running
      `ASPNETCORE_ENVIRONMENT=Development` — `ValidateOnBuild` rejects the scoped
      `SalesRepRoleResolver` consumed from XCart's singleton `CanAccessCartAuthorizationHandler`.
      That is every customer's local platform. Candidate fix: a singleton resolver caching via
      `IPlatformMemoryCache` with `SecurityCacheRegion.CreateChangeToken()`.
- [ ] The plugin's `useSalesRepsConfig.ts` comment says `SalesRep.Enabled` defaults to `false`;
      `ModuleConstants` says `true`. Fix with the next plugin PR.

Cross-references: prod telemetry for failed/skipped plugins (#6), CSP at the ingress (#4),
`validate:core-types` back into `yarn validate` (#5 — expect the known false red from vue-tsc's
VcButton `tabindex` ordering artefact).

## 1. Pilot: the sales-rep storefront plugin

Prove the full loop (build → host → gate → `loadRemote` → `init`) with a real feature.
Definition and rationale: *Pilot* section of the discovery spec.

- [x] **Publish the first facade release** (`core-v0.1.0`, 2026-09-10) — run the *Core Facade Release* workflow once so the
      `core-v<CORE_VERSION>` URL that fresh scaffolds pin actually resolves. The scaffolder reads the
      host's current version, so do not hardcode one here.
- [x] Scaffold the plugin (`yarn create:plugin`) into `vc-module-sales-rep` (#13, `StorefrontApp/`), building into its
      `plugins/vc-frontend/` folder so the platform advertises it (#2). The scaffolder emits the
      `public/plugin.json` that declares `exposed: "./plugin"` — verify it lands in `dist/`, since
      the platform's default is `./Module`.
- [ ] **Plugin-repo CI guard:** fail the plugin build if the committed `@vc-frontend/core`
      value isn't the pinned release URL (catches a stray `file:`/`portal:`/yalc leak).
- [ ] **Route authorization** — sales-rep is rep-only; plugin `addRoute` has no
      permission/guard primitive in the facade yet. Likely a pilot blocker for real users.
      Partly addressed: the loader wraps the router for the whole load-and-init phase and refuses a
      plugin claim on a name the host owns (`router.addRoute` evicts a same-named root route, and
      vue-router's own warning is dev-only). It covers every name one call would claim — both
      `addRoute` overloads and each named entry in `children` — and `removeRoute` of a host name,
      so remove-then-add cannot launder a squat. That covers takeover, not authorization, and only
      inside the window: a claim made after the phase settles is unguarded.
- [ ] **Declare plugin routes in `plugin.json` so boot stops blocking on the loader** — VCST-5761.
      Today `app.mount()` waits for the whole loader, so a slow plugin is blank-screen time for the
      entire storefront. If a plugin declares the paths it intends to take, the host can register a
      placeholder that shows a loading state and resolves once the plugin settles, install the
      router immediately, and pay nothing at first paint. It also removes the backstop's
      "late plugins register routes after the first navigation" hole, and makes the plugin count N
      stop mattering (no cap needed while boot is not on the critical path). Needs a fallback: if
      the loader settles and the plugin never claimed the path, the placeholder 404s.
- [ ] **Extension-registry precedence: the host must win regardless of order** — VCST-5762.
      Host module inits are fire-and-forget while the plugin's `init()` is awaited, and
      `useExtensionRegistry.register` keeps the first claim with a dev-only warn. So which of a
      host module and a plugin owns a `category/name` is decided by whichever continuation lands
      first. The fix needs `register` to know the caller (host claim overwrites a plugin-held key
      and is reported; plugin claim on a host-held key is refused into the loader's outcome), which
      changes a facade-exported signature — hence a contract rebuild, hence not in the discovery PR.
- [ ] Facade additions the plugin turns out to need (→ #7 guard rails).

## 2. Runtime discovery — done, via the platform rather than a store setting

The platform shipped its own answer (x-api 3.1016.0 / x-frontend 3.1005.0): `AppManifestService`
advertises every installed module carrying `plugins/vc-frontend/`, xAPI projects that as
`store.plugins(appId:)`, and the loader consumes it. Installing a module now adds a plugin with no
host rebuild, and `APP_MODULES_FEDERATION_REMOTES` stayed the local override — the precedence this
section had already decided.

Dropped with it: the central `ModuleFederation.Remotes` store setting, its dedicated platform
module, and the versioned cross-source descriptor. Two sources remain (platform, env override), each
with its own resolver normalizing into `IRemoteDescriptor` — but there is no third shape to design
for.

Still open:

- [ ] **Freshness of the list** — our side is uncached, so a newly installed plugin appears on the
      next page load. What is left is platform-side: `AppManifestService` caches its manifest for
      the process lifetime.
- [x] **Theme master switch** — `module_federation_enabled` in `client-app/config/settings_data.json`
      is the only switch: `vite.federation.ts` gates the build, `enabled.ts` the runtime.
- [ ] **Backend-capability gate** — `requiredBackendModules` precondition checked against
      the installed module list before load; unmet ⇒ `skipped` with a distinct reason
      (decided in review: discovery-decoupling ≠ functional-decoupling).
- [ ] **Plugin styling containment — decided, tracked as VCST-5760** (sprint 26-17). Full analysis,
      measurements and the rejected alternatives: `specs/2026-08-21-plugin-css-cascade-layers.md`.
      Native cascade layers, order declared by the host:
      `@layer host-base, vendor, host-components, plugin, host-utilities, plugin-overrides;`. `plugin` below
      `host-utilities` means a plugin's copy of a host utility can never win on host markup; above
      `host-components` means `class="p-6"` in a plugin template is not silently beaten by the host
      globals that reach into its DOM (236 of 262 host SFC style blocks are global); and
      `plugin-overrides` on top makes a deliberate override deterministic without `!important`.
      The plugin author does nothing — plain utilities in templates, `@apply` in styles, no prefix.
      Measured regression surface for moving the host's utilities into a top layer: **four** rules —
      one to repair (`shared/static-content/components/call-to-action.vue:42`) and three that flip
      toward the caller's intent (`<VcMarkdownRender class="text-sm">` twice,
      `<ChangePasswordForm class="lg:w-1/2">` once). Earlier answers are superseded: a
      Tailwind `prefix` (rejected on DX), `@scope` (rejected — `<Teleport>` escapes the scope root),
      and `<style scoped>` + `@apply` with no global layer (rejected — a plugin that is three widgets
      has nowhere to put shared styles), which was the PR #2372 prototype that is not landing.
- [x] **Name-collision dedup** — the first descriptor to survive validation wins; a later plugin
      claiming the same name is reported in `skipped` under its own id, since the contested name
      belongs to the winner. Previously both were registered and both loaded, so one plugin's code
      never ran while still being reported as loaded. `{ force: true }` has since been dropped from
      `registerRemotes` — see below.

## 3. Artifact integrity for remote code

Remotes load over https from trusted hosting, but there is no integrity/signature check
on the manifest or chunks (MF has no native SRI story). This also covers the known
**TOCTOU** window: the gate fetches the manifest, then the MF runtime independently
fetches it again for loading — a redeploy between the two requests means validated ≠ executed,
plus a second round trip per remote.

- [ ] **Seed the validated manifest through the runtime's `fetch` loader hook.** Worth doing on its
      own, independent of integrity. `SnapshotHandler.getManifestJson` emits
      `loaderHook.lifecycle.fetch` before its own `fetch` and uses a returned `Response`, so an MF
      host plugin that replies with the body the gate already read makes validated bytes == executed
      bytes and removes the second round trip per remote. Earlier notes here claimed the cache was
      not seedable; that was wrong.

The 2026-07-06 review called this **a prerequisite for enabling runtime discovery in prod, not a
later hardening pass**, on the grounds that a store-editable setting plus a mutable origin is a
code-execution surface for whoever can edit the setting. Both halves of that premise are gone:
there is no editable setting (the source is module installation, already a code-execution
capability), and the origin is no longer mutable — it is checked, not assumed. What the premise
change does NOT cover:

- [x] Platform entries and stylesheets are checked for **same-origin** (`isSameOrigin`), so a
      descriptor cannot name a foreign host, and a platform entry must resolve to an **http(s)**
      URL after the manifest rewrite (a `blob:` URL shares this origin but has an opaque path, which
      makes the rewrite a no-op and would leave MF script-loading the entry as code).
      `isAllowedRemoteUrl`'s https rule covers the env override, where cross-origin is the point —
      and the manifest RESPONSE is re-checked against the rule of the source it came from, not
      against same-origin for both, which would have killed the env override outright.
- [x] **Remote names are validated** on both paths (`/^[A-Za-z0-9][A-Za-z0-9._-]*$/`). MF resolves a
      `loadRemote` id by prefix, so `a/plugin` could answer the request meant for `a` and serve its
      expose from the wrong bundle with both reported loaded; exact-name dedup cannot see it.
- [x] **Malformed descriptors cost one plugin, not the batch.** Every field is read through a string
      guard and the list is checked for arrayness — a non-string `permission` or `entry.type` used
      to throw out of the loader and lose every plugin, contradicting "isolation is total".
- [x] No integrity check on what actually executes — **reviewed, deliberately not done**. Writing
      the artifacts requires access to the backend that serves them, and from there an attacker
      returns hostile code on the *first* fetch; the TOCTOU window is a sub-case of a position
      already lost. Nor is it implementable host-side: MF loads `remoteEntry.js` through an
      injected `<script>`, so the executed bytes are never ours to hash, and `entry.hash`
      (`8DBA4F3C`) is a cache-buster, not an SRI digest. If plugins ever come from a host other
      than our own backend, revisit — immutable **versioned URLs** are then the cheapest form
      (they make both fetches return the same bytes, though the second fetch remains).

## 4. CSP at the vc-deploy ingress (prod prerequisite)

No security headers exist in the reference stack today; a **tight base CSP is a from-zero
project on the prod critical path** (GA4/Hotjar/inline scripts currently need
`unsafe-inline`-class allowances). Never a `vc-frontend` repo change. Analysis and
decisions (path-scoping, versioned-immutable URLs, drift validation): *Security guard*
section of the discovery spec.

- [ ] Introduce the CSP at the nginx ingress (per-env, git+PR): `configuration-snippet`
      annotation or controller custom-headers ConfigMap.
- [ ] **Path-scope** plugin origins. Platform plugins are same-origin, so their baseline is a plain
      `self`; path-scoping applies to the env-override/external-hosting case
      (e.g. `script-src https://cdn.jsdelivr.net/gh/VirtoCommerce/`). The discovery spec's
      *Security guard* section argued this for the abandoned external-CDN model — read it as history.
- [ ] Validate configured remote origins against the env CSP (two-control-plane drift);
      surface CSP-blocked loads as a **distinct, observable** loader outcome.
- [ ] Keep a build-time exact-URL allowlist as complementary defense-in-depth (CSP gates
      loading; it does not contain a loaded plugin).

## 5. Plugin-side story in CI

`yarn create:plugin` output is verified end to end (install, build, manifest metadata,
type-check — including from the real tarball), but only manually. Remaining:

- [ ] Wire the scaffold → install → build cycle into CI (locks the plugin contract).
- [ ] **Re-wire `validate:core-types` into `yarn validate` when MF ships.** It was
      removed from the aggregate `validate` script during the pilot (no plugin consumes
      the contract yet) so that unrelated PRs — e.g. a routine GraphQL-types regen, which
      reaches the contract through the facade's `apolloClient`/`graphqlClient`
      re-export — aren't blocked by contract drift. Once a plugin depends on the contract,
      add `&& yarn validate:core-types` back to the `validate` script in `package.json`.
- [ ] **Host PR CI: fetch the `dev` baseline** for `validate:core-types` (only matters
      once the check above is re-wired into CI) — the removal-detection gate
      (`compareContractToBase`) degrades to a loud warning when the checkout is too
      shallow to see the base branch's committed contract. Needs `fetch-depth: 0` (or an
      explicit `git fetch origin dev`) in the theme CI checkout.
- [ ] A live `loadRemote` smoke against a running host build.
- [x] `resolveRemotes` coverage for name collisions and for a valid-but-empty `{}` override, which
      now says so in the log instead of suppressing the platform list silently.
- [x] **Guard test for the load-bearing boot ordering** — `setThemeContext(store)` and
      `setUser(userResult)` must both run before `startFederatedModules()`; plugins resolve store
      settings through `useModuleSettings`, and the permission gate reads `user.value` at call
      time. `boot-order.test.ts` executes the real `app-runner` against mocked collaborators and
      asserts the order the calls actually happen in, so moving one into a callback or a branch
      fails too — not only moving its line.

## 6. Stage 2 — hardening & scale-out (not yet designed)

From the 2026-07-06 review. None of these block shipping the harness — it ships on by
default behind `module_federation_enabled`, loads only what installed modules advertise, and
fails closed and bounded. They become relevant when scaling past a controlled pilot (more plugins,
third-party authors, runtime discovery, broad store rollout); the kill switch and CSP are the
two to treat as prerequisites for *that* stage (artifact integrity is not — see #3). (Route
authorization moved to #1 — it likely blocks the pilot.)

- **Inter-plugin isolation** — route-path collisions and extension-key clobbering between plugins
  are unhandled (only host-vs-plugin isolation exists). Duplicate remote names are handled — see #2.
- **Kill switch** — killing a bad plugin means uninstalling its module (or a host rebuild when it
  came from the env override); there is no per-plugin toggle. Gate prod exposure on CSP.
- **Boot cost ∝ N** — all remotes are manifest-fetched / loaded / `init`'d eagerly before
  `app.use(router)`; add a lazy/route-triggered tier for non-critical plugins.
- **Route fallback** — deep links to a skipped/failed plugin route degrade to a generic
  routing failure; reserve host placeholder routes / a "feature unavailable" contract.
  Related: when a plugin settles AFTER the boot backstop and registers its route late,
  the user who deep-linked keeps seeing the 404 even though the route now exists
  (`router.addRoute` does not re-match the current location) — a late-settlement
  `router.replace(currentRoute.fullPath)` when the current match is the not-found route
  would recover it.
- **SSR/SEO** — `loadRemote` is client-side, so plugin routes are CSR-only (rules out MF for
  SEO-relevant public content; fine for authenticated sales-rep).
- **Plugin i18n** — no contract for a plugin to register translation messages / RTL.
- **Compat-drift governance** — no registry of plugin↔host versions / host-major breakage
  detection across N plugins.
- **Prod telemetry for failed/skipped plugins (AppInsights)** — the one deferred item still
  without a Jira id, and the one that makes the others invisible. An observability
  improvement, not a blocker: the harness fails closed and ships fine without it. `Logger`
  is a no-op in production, so a failed/skipped plugin leaves no prod signal today (dev gets
  console via Logger). Design sketch: expose the AppInsights instance to
  boot-time code via an `onLoaded`-fed module singleton + a `getAppInsightsWhenReady(timeout)`
  bridge in `applicationInsights.plugin.ts` (the library's `useAppInsights()` is inject-based;
  the loader starts before the plugin installs, so a bare read is always undefined), then
  report `failed` as `trackException` and `skipped` as a `[MF] federated plugin skipped`
  customEvent (split streams so gate-noise cannot drown real failures), fire-and-forget.
  Also report boot-backstop overruns (`bootstrap.ts`) — today an overrun leaves no prod
  signal at all, so sporadic missing-plugin incidents cannot be correlated to slow boots.
  Harden install() while at it: `app.use(AppInsightsPlugin)` in try/catch — `Logger.error` +
  a `useNotifications()` toast, settle the ready promise, keep booting (a malformed
  instrumentation key must not white-screen the store).
- **Contract-gate granularity** — breaking-change detection (`core-api/contract-versioning.mjs`)
  diffs top-level export *names* only: a signature/type change to an existing export ships as
  a minor bump, `^`-satisfies the contract gate, and a stale plugin loads against the changed
  surface anyway. Fix is structural API diffing (api-extractor / ts-morph over the two `.d.ts`
  programs) or requiring a human minor/major classification on any contract change.
- **Multi-store vs env granularity** — one env/backend serves many stores → per-store remote
  lists but a per-env ingress CSP that must allowlist the *union* of every store's origins.
- **Discovery depends on x-api ≥ 3.1016.0** — an older backend cannot answer `store.plugins`, so
  discovery fails closed to no-remotes. Its own query keeps that failure off the boot store query,
  and `SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT` keeps it off the user's screen — without that context
  the global handler broadcasts a generic error toast to every open tab.

## 7. Facade surface review (ongoing guard rails)

The current facade (`core-api/index.ts`) is intentionally minimal. As real plugins get
built, expect requests to widen it. Guard rails:

- Keep it **additive** — removing/renaming ⇒ breaking ⇒ `CORE_VERSION` bump.
- Every addition grows `contract/index.d.ts` and its transitive type graph — watch the size.
- Prefer exposing **composables/functions** over raw internals, so the implementation can
  change behind the facade without breaking the contract.
