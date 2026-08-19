# Federated Modules — TODO / open work

Tracking for **VCST-5159**. Backlog only — everything here is **not implemented yet**.
Decisions, rationale, and review analysis live in [`specs/`](./specs/)
(discovery/hosting/enablement: [`2026-07-06-discovery-hosting-decision.md`](./specs/2026-07-06-discovery-hosting-decision.md);
facade distribution: [`2026-07-06-facade-distribution-design.md`](./specs/2026-07-06-facade-distribution-design.md)).
Roughly in priority order.

---

## 1. Pilot: the sales-rep storefront plugin

Prove the full loop (build → host → gate → `loadRemote` → `init`) with a real feature.
Definition and rationale: *Pilot* section of the discovery spec.

- [ ] **Publish the first facade release** — run the *Core Facade Release* workflow once
      so the `core-v1.0.0` URL that fresh scaffolds pin actually resolves.
- [ ] Scaffold the plugin (`yarn create:plugin`) into **its own repo**; host `dist/` on
      jsDelivr / GitHub Pages; wire into the host via hardcoded `APP_MODULES_FEDERATION_REMOTES`.
- [ ] **Plugin-repo CI guard:** fail the plugin build if the committed `@vc-frontend/core`
      value isn't the pinned release URL (catches a stray `file:`/`portal:`/yalc leak).
- [ ] **Route authorization** — sales-rep is rep-only; plugin `addRoute` has no
      permission/guard primitive in the facade yet. Likely a pilot blocker for real users.
- [ ] Facade additions the plugin turns out to need (→ #7 guard rails).

## 2. Runtime discovery — done, via the platform rather than a store setting

The platform shipped its own answer (x-api 3.1016.0 / x-frontend 3.1005.0): `AppManifestService`
advertises every installed module carrying `plugins/vc-frontend/`, xAPI projects that as
`store.plugins(appId:)`, and the loader consumes it. Installing a module now adds a plugin with no
host rebuild, and `APP_MODULES_FEDERATION_REMOTES` stayed the local override — the precedence this
section had already decided.

Dropped with it: the central `ModuleFederation.Remotes` store setting, its dedicated platform
module, and the per-source descriptor adapters. The platform's descriptor is the only shape now, so
there is nothing left to normalize between sources.

Still open:

- [ ] **Freshness of the list** — it rides on the boot store query, which localStorage-caches for
      an hour, so a newly installed plugin can take that long to appear. Acceptable for now (the
      platform caches its own manifest for the process lifetime); revisit if operators expect an
      immediate effect.
- [ ] **Theme master switch** in `client-app/config/settings_data.json` for the runtime
      role of `APP_MODULES_FEDERATION_ENABLED` — while keeping a build-time bundling gate
      (`vite.federation.ts` can import the JSON, or a build switch survives).
- [ ] **Backend-capability gate** — `requiredBackendModules` precondition checked against
      the installed module list before load; unmet ⇒ `skipped` with a distinct reason
      (decided in review: discovery-decoupling ≠ functional-decoupling).
- [ ] Later, optional: `AppManifestService` as an **additional** discovery source
      (vc-shell module convention) feeding the same descriptor list.

## 3. Artifact integrity for remote code

Remotes load over https from trusted hosting, but there is no integrity/signature check
on the manifest or chunks (MF has no native SRI story). This also covers the known
**TOCTOU** window: the gate fetches the manifest, then the MF runtime independently
fetches it again for loading (its cache is not publicly seedable) — a redeploy between
the two requests means validated ≠ executed, plus a second round trip per remote.
Evaluate: signed manifests, hash pinning, or CSP `strict-dynamic` + nonce approaches.
With settings-driven discovery (#2), the natural home for a pin is a per-remote `hash`
field on the setting entry — mirrors vc-shell's `entry.hash`.

**This is a prerequisite for enabling runtime discovery in prod, not a later hardening
pass** (review 2026-07-06): runtime, store-editable settings + a mutable origin otherwise
constitute a code-execution surface for whoever can edit the setting. Immutable **versioned
URLs** are the cheapest form — they also eliminate the TOCTOU window and the manifest
double-fetch outright.

## 4. CSP at the vc-deploy ingress (prod prerequisite)

No security headers exist in the reference stack today; a **tight base CSP is a from-zero
project on the prod critical path** (GA4/Hotjar/inline scripts currently need
`unsafe-inline`-class allowances). Never a `vc-frontend` repo change. Analysis and
decisions (path-scoping, versioned-immutable URLs, drift validation): *Security guard*
section of the discovery spec.

- [ ] Introduce the CSP at the nginx ingress (per-env, git+PR): `configuration-snippet`
      annotation or controller custom-headers ConfigMap.
- [ ] **Path-scope** plugin origins (e.g. `script-src https://cdn.jsdelivr.net/gh/VirtoCommerce/`).
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
- [ ] When #2 lands: coverage for the new `resolveRemotes` (multi-source, precedence truth
      table, name-collision dedup) and a **guard test for the load-bearing ordering
      claim** — `setThemeContext(store)` must run before `startFederatedModules()`
      (currently asserted, untested).

## 6. Stage 2 — hardening & scale-out (not yet designed)

From the 2026-07-06 review. None of these block shipping the harness — it is off by
default, and flag-on with a build-pinned list of trusted plugins fails closed and is
bounded. They become relevant when scaling past a controlled pilot (more plugins,
third-party authors, runtime discovery, broad store rollout); the kill switch and
CSP/integrity are the two to treat as prerequisites for *that* stage. (Route
authorization moved to #1 — it likely blocks the pilot.)

- **Inter-plugin isolation** — route-path collisions, duplicate remote names, extension-key
  clobbering between plugins are unhandled (only host-vs-plugin isolation exists).
- **Kill switch** — the hardcoded pilot needs a **rebuild** to kill a bad plugin; gate any
  prod exposure on settings + CSP + integrity. Note store-settings propagation/cache latency.
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
- **Prod telemetry for failed/skipped plugins (AppInsights)** — a stage-2 observability
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
- **Central `ModuleFederation` module** becomes a hard discovery dependency in every
  store/env (fail-closed to no-remotes if absent) — state it.

## 7. Facade surface review (ongoing guard rails)

The current facade (`core-api/index.ts`) is intentionally minimal. As real plugins get
built, expect requests to widen it. Guard rails:

- Keep it **additive** — removing/renaming ⇒ breaking ⇒ `CORE_VERSION` bump.
- Every addition grows `contract/index.d.ts` and its transitive type graph — watch the size.
- Prefer exposing **composables/functions** over raw internals, so the implementation can
  change behind the facade without breaking the contract.
