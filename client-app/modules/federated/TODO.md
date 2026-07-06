# Federated Modules — TODO / deferred work

Tracking for **VCST-5159**. These are known follow-ups deliberately left out of the
initial harness to keep the first cut small and reviewable. Roughly in priority order.

---

## 1. Per-environment remote discovery & hosting — DECIDED

**The constraint that forced a decision.** `APP_MF_HOST` / `APP_MF_REMOTES` are read from
`import.meta.env`, **inlined at build time** — so one theme artifact carries one hardcoded
plugin list and on/off state. That doesn't compose with how environments are configured:
`vc-deploy-dev` is ArgoCD + Kustomize, where per-env values (DB host,
`VirtoCommerce__Endpoint__Url`, the SPA zip via `MERCURY_THEME_URL`) are injected as
**runtime** ConfigMap values per overlay. A build-time-inlined bundle can't read those —
QA and DEV can't load different plugins from the *same promoted artifact* without a
separate build per env. The decision below removes that.

**Decision in one line:** resolve the enable-flag + remote list at **runtime from platform
Store settings**, per environment; host each plugin artifact on **any origin that meets a
fixed contract** (provider-agnostic); guard with the **CSP**. No new backend module for the
first plugin.

### Discovery — platform Store settings (runtime, per-env)

The host reads a list of `{ name, url }` at boot from the store settings the SPA
**already fetches**: `app-runner.ts` → `setThemeContext(store)` populates
`themeContext.storeSettings` (`store.settings.modules[].settings`), read via
`useModuleSettings` (already in the facade). `google-analytics` and `useHotjar` already
gate on it this exact way. Per-env is automatic — each env's storefront talks to that
env's backend, each store has its own settings → QA store ⇒ QA remotes, one promoted
artifact, no CI vars, no per-env build. Boot order already works: `setThemeContext` runs
**before** `startFederatedModules()`, so `storeSettings` is present when the loader boots.

The settings home is a **central `ModuleFederation.Remotes` store setting** (`[{name,url}]`,
`IsPublic`, store-level), owned by one small dedicated platform module — deliberately **not**
tied to any plugin's own BE module. We do **not** have each BE module self-declare its remote:
the FE plugin lives in **its own repo, decoupled from any BE module**, so routing discovery
back through a BE module's settings would re-introduce exactly the dependency we're removing.
One central, source-agnostic list is the target.

Why not vc-shell's `AppManifestService` as the primary: it discovers only plugins
**shipped inside an installed platform module and served from the platform origin** — it
cannot register an externally-hosted, pure-frontend plugin. Since we want that
expandability, settings is primary; `AppManifestService` can be added **later as an
additional source** feeding the same `{name,url}` list (not either/or).

**Cost / risk: none structural.** The settings subsystem is generic (EAV) ⇒ **no DB
migration** to add a descriptor; the change is **additive and backward compatible** (absent
setting ⇒ no remotes ⇒ today's no-op; extra entries ignored by older clients). This is the
exact pattern ~30 modules already use (GA4, Hotjar, Loyalty, News, …).

### Enablement — three levels, no `APP_MF_HOST`

- **Theme master switch** → a flag in `client-app/config/settings_data.json` (theme config,
  read via `useThemeContext` at boot). Replaces only the **runtime** role of `APP_MF_HOST`.
  ⚠️ It does **not** replace `APP_MF_HOST`'s **build-time** role (the Vite
  `federatedHostPlugin`, `vite.config.ts:68` / `vite.federation.ts`, which decides whether
  the MF runtime is bundled at all) — see *Review findings* below.
- **Runtime per-env** → the store setting (`Enabled` + the list).
- **Local/dev override & pilot hardcode** → `APP_MF_REMOTES` (kept — lets a frontender
  point at `localhost:3001` with no backend setting, and is how the first plugin is wired
  *before* settings-driven discovery exists). **Decided:** when set, `APP_MF_REMOTES`
  **overrides** the runtime setting (a true local/dev override — it does not lose to it).
- **Seams:** the flag check in `bootstrap.ts` and `resolveRemotes()` in `index.ts` — the
  only spots reading `import.meta.env.APP_MF_*` today.

### Hosting — provider-agnostic contract (decoupled from discovery)

The setting holds a **URL**; the host never knows or cares who serves it — so hosting is
**provider-agnostic by construction**. Any origin qualifies if it meets this contract:

- static serving (no SSR), **https**, **CORS** (cross-origin manifest + chunk fetch);
- **immutable cache on content-hashed chunks + short/revalidate on the manifest**;
- **stable, ideally versioned URL** (per-env pinning + cache-bust);
- browser-reachable and **allowlisted in the CSP**;
- plugin built with `publicPath: "auto"`.

The artifact is **not** shipped in the BE module zip — that would re-couple FE releases to
module releases and force frontenders to run the platform locally (see *Separation of
concerns* below). Providers are interchangeable **examples that satisfy the contract**,
chosen per-env via the setting URL — jsDelivr / GitHub Pages (pilot & dev/QA), Cloudflare
Pages / Azure Static Web Apps / Blob+CDN / own CDN (prod). Run one in QA and another in
prod with zero host change.

### Facade distribution & local co-dev (decided)

How the separate-repo plugin gets `@vc-frontend/core` (types + `federation.mjs` + tailwind
preset — all **build-time**; the runtime instances are injected by MF, nothing to serve). The
host repo is **public** (`package.json "private": true` only blocks `npm publish`, not repo
visibility), so **no registry, token, or account is needed**:

- **Committed / CI (decided): a versioned tarball URL.** A **manual (`workflow_dispatch`)
  release workflow** runs `npm pack` in `core-api` → `vc-frontend-core-<CORE_VERSION>.tgz`,
  uploaded as a **GitHub Release asset** on this public repo tagged `core-v<CORE_VERSION>`;
  the plugin pins that URL. Public ⇒ **no token to consume**, works on ADO/GitHub/anywhere,
  PM-agnostic, tiny (no repo clone), versions coexist. It's an immutable **release artifact**,
  drift-checked against the committed contract before packing.
  - *Rejected:* hosting the tarball in the storefront's `dist` / served theme assets — that
    ties the plugin's *build* to a *deployed* storefront env and makes the contract version
    track the deployment instead of an immutable release. The tarball must be a **release
    artifact, not a file served by a running storefront**. (Any public static host / the plugin
    CDN works too — just not the deployed storefront's assets.)
  - *Fallback:* Yarn `#workspace=@vc-frontend/core` git link — no publish step, but clones the
    whole (large) storefront repo per install and is Yarn-Berry-only.
  (An npm registry is therefore **not needed** — see "Not doing".)
- **Local co-dev (editing the host facade + plugin together, unpushed):** **yalc** —
  `yarn build:core-types && yalc publish` in `core-api` → `yalc add @vc-frontend/core` in the
  plugin → `yalc push` on change. Purely local/offline (`~/.yalc` store): **no tokens,
  accounts, or registry**, and bundler-robust (copies real files — no symlink
  duplicate-instance footgun). Don't commit `.yalc/` or the injected `file:` dep; `yalc remove`
  + restore the pinned reference before pushing. (vc-shell solves the same problem with an
  automated `portal:` rewrite script — `scripts/setup-app.ts` / `yarn setup:apps` — which flips
  `@vc-shell/*` deps to `portal:` local paths + `preserveSymlinks` and reverts via
  `unsetup:apps`; yalc is the clearer, secret-free equivalent for us.)

**Implementation details — IMPLEMENTED (harness side), except where noted:**

- ✅ **Version / tag:** `core-v<CORE_VERSION>` (CORE_VERSION is single-sourced from
  `core-api/package.json`); tarball `vc-frontend-core-<CORE_VERSION>.tgz`. Independent of the
  host app version in the root `package.json`.
- ✅ **What's packed:** `files` field in `core-api/package.json` — the tarball carries only
  the distributables: `dist/index.d.ts`, `dist/tailwind-preset.cjs`, `federation.mjs`,
  `federation.d.mts` (+ `package.json` and `README.md`, included automatically).
  `"private": true` stays — it blocks `npm publish`, not `npm pack`.
- ✅ **Tailwind preset made tarball-safe** (found by installing the real tarball): the old
  `tailwind-preset.cjs` re-exported `../../tailwind.config` — resolvable only via
  `portal:`/yalc, dead in a tarball. Now **generated** as a self-contained snapshot
  (`dist/tailwind-preset.cjs`, emitted + drift-checked by `build:core-types`; theme data
  inlined, the config's Tailwind plugins re-emitted as consumer-resolved `require`s —
  the scaffold installs `@tailwindcss/container-queries` + `tw-elements` with
  `--with-tailwind`). A preset change auto-bumps `CORE_VERSION` like a contract change
  (the released tarball is immutable per version).
- ✅ **Release workflow:** `.github/workflows/core-facade-release.yml` — **manual
  `workflow_dispatch`** (decided: a human chooses when a contract version becomes consumable;
  not auto-on-merge, not tag-triggered). Steps: `yarn validate:core-types` (read-only drift
  check — NOT `build:core-types`, which would regenerate/auto-bump in CI) → fail if
  `core-v<CORE_VERSION>` already released (immutability) → `npm pack` → `gh release create`
  with the built-in `GITHUB_TOKEN` (`permissions: contents: write`, no stored secret).
- ✅ **Plugin committed dep** (what `yarn create:plugin` now generates; example):
  `"@vc-frontend/core": "https://github.com/VirtoCommerce/vc-frontend/releases/download/core-v1.0.0/vc-frontend-core-1.0.0.tgz"`
  — `yarn.lock` records the tarball checksum, so the pin is tamper-evident. The scaffolder no
  longer emits `portal:` (and dropped the Berry-only `packageManager` pin with it).
- ✅ **`./federation` + tailwind preset:** the tarball preserves the `exports` map, so
  `@vc-frontend/core/federation` (the plugin's `vite.config` shared-dep config) and
  `@vc-frontend/core/tailwind-preset` resolve from the same install — no separate distribution.
- ✅ **yalc hygiene:** scaffolded `.gitignore` covers `.yalc/` + `yalc.lock`; scaffolded README
  states the pinned-URL rule; host gains `yarn core:yalc-push` (rebuild contract + push to all
  linked plugins). Never commit the injected `file:.yalc/…` dep — `yalc remove
  @vc-frontend/core` + restore the pinned URL before pushing.
- ⏳ **Deferred to the plugin repo:** the CI check that fails the plugin build if the committed
  `@vc-frontend/core` value isn't the pinned release URL (guards against a stray
  `file:`/`portal:` slipping in) — it lives in the plugin's CI, which doesn't exist yet.
- ⏳ **First release:** run the *Core Facade Release* workflow once after this lands, so the
  pinned `core-v1.0.0` URL that fresh scaffolds reference actually resolves.

### Security guard — the CSP *is* the allowlist

Once the list is runtime data, "who can register a code-executing remote" needs a guard
**above** store-settings-edit. That guard is the **CSP**, set at the **vc-deploy nginx
ingress** (per-env, git+PR-controlled, browser-enforced): the browser refuses to
fetch/execute from any origin not in `script-src` / `connect-src`, so a bad setting entry
can't load. **Not a build-time frontend allowlist** (a runtime-data list guarded by a
runtime-data list is no guard) — and not build-time, per the decision. Consequence: **CSP
is a hard prerequisite for enabling MF in prod**, and it does not exist in the reference
stack today (no security headers at all). Enabling MF means introducing it — nginx
`configuration-snippet` annotation, or the controller custom-headers ConfigMap if snippet
annotations are locked down. It is never a `vc-frontend` repo change.

### Separation of concerns / local dev (why this shape)

- **FE releases independently:** the plugin builds + deploys on its own cadence to its own
  origin; the BE module ships the settings descriptor **once**; thereafter the URL value
  (runtime setting) and the artifact (external host) change with **no module release**.
- **Local dev needs no backend/module:** frontenders run only the plugin
  (`yarn preview` → `:3001`) + the storefront with `APP_MF_REMOTES`, pointed at a **shared
  remote backend** via `APP_BACKEND_URL` (as `.env.local` already does). No local platform,
  no local module.

### Pilot — `vc-module-sales-rep` (doubles as the #3 reference remote)

sales-rep is full-stack (Core/Data + xAPI + a vc-shell backoffice app). Its storefront
plugin is a **new, separate** frontend in **its own repo** (built vs `@vc-frontend/core`,
exposes `./plugin`, declares `requiredHostVersion`) — **not** the existing backoffice
`Web/App`, and **not** shipped from the BE module.

**For the pilot, hardcode the remote** via the existing build-time `APP_MF_REMOTES` path —
no store settings, no platform module, no new plumbing. That is enough to prove the full
loop (build → host → gate → `loadRemote` → `init`) end-to-end and satisfies TODO #3. The
settings-driven central list is the target *once the loop is proven*; it is **not** a
prerequisite for the pilot.

### Deferred within this item

- The settings-driven **central `ModuleFederation.Remotes`** store setting + its one small
  platform module (+ an edit permission). This is the step from hardcoded (`APP_MF_REMOTES`)
  → runtime per-env settings; source-agnostic, not tied to any plugin's BE module.
- `AppManifestService` as an optional **additional** discovery source (vc-shell-style
  module convention), feeding the same `{name,url}` list.
- Per-remote **integrity hash** carried in the setting entry → folds into #2.
- Facade additions the sales-rep plugin needs → #4.

> **Until implemented,** the build-time `APP_MF_REMOTES` env (current behavior) remains the
> only path — a manual, deploy-owned, rebuild-per-change action with no runtime toggle.

### Review findings (2026-07-06) — corrections & open gaps

A multi-agent, code-verified architecture review confirmed every claim about *current* code
(boot order, seams, facade, GA4/Hotjar precedent) but found the following. **The hardcoded
dev/QA pilot is unaffected** — proceed with it; the items below gate the *runtime/prod*
end-state, so **#1 stays provisional** until a settings-driven path exists end to end (the
pilot proves remote *loading*, not the registry/precedence/CSP workflow).

**Corrections to the text above**

- **`settings_data.json` does not fully replace `APP_MF_HOST`** (see the ⚠️ above): the
  build-time bundling gate must also read the flag (`vite.federation.ts` — Node can import
  the JSON), **or** a build-time switch survives. Frame the theme flag as
  *build-time-by-necessity for runtime bundling*; per-env on/off is the store `Enabled` flag.
- **The registry entry is not `{name,url}`.** It already needs `enabled`, will need `hash`
  (integrity) and `source`, plus AppManifestService fields. Define a **versioned normalized
  descriptor** `{ name, url, enabled, version?, requiredHostVersion?, hash?, source }` with
  per-source adapters so source-specific fields don't leak into the host.
- **Precedence is underspecified.** Define one canonical `resolveRemotes()` resolution + a
  truth table over {theme switch × store `Enabled` × store list × `APP_MF_REMOTES`}:
  present-vs-empty, replace-vs-merge, and **name-collision dedup** (`registerRemotes({force:true})`
  silently overrides a duplicate). **Decided:** local `APP_MF_REMOTES` **overrides** the
  runtime setting (true dev/local override).
- **Say "provider/hosting-agnostic," not "host-agnostic."** Authoring is coupled to this
  host's private `@vc-frontend/core` + `./plugin` + `requiredHostVersion` + `portal:`
  checkout; external authorship stays blocked on the deferred npm/portal decision — scope
  external-author claims to first-party. Discovery is **platform-bound** (store settings /
  AppManifestService are VC channels; the host hardcodes the module id + setting key):
  decoupled from plugin *modules*, not from the backend control plane. "Independent cadence"
  holds for minor/patch; shared-singleton **major** bumps are coordinated (breaks all
  plugins until rebuild).

**CSP is necessary but NOT sufficient** (the "CSP is the allowlist" claim is over-stated)

- **Shared-CDN origins collapse an origin-only allowlist** — anyone who can write the setting
  points `url` at another path on the same allowlisted host (`cdn.jsdelivr.net/gh/attacker/…`)
  with their own code. **Decided (no dedicated origin required):** *path-scope* the CSP to our
  namespace (e.g. `script-src https://cdn.jsdelivr.net/gh/VirtoCommerce/`) at the ingress, and
  pair it with **versioned-immutable URLs** (CSP path matching is weakened by redirects; a
  pinned version has none). Hash pinning (#2) is the airtight form. **Not needed for the
  pilot** — the hardcoded `APP_MF_REMOTES` list is build-controlled, so shared CDNs (jsDelivr)
  are safe there. Dedicated origins / `*.plugins.example.com` only if we outgrow path-scoping.
- **A *tight* base CSP does not exist today** (GA4/Hotjar/inline scripts) — hardening it (no
  `unsafe-inline`, no wildcard) is a **from-zero project on the prod critical path**, not an
  annotation. Track it as its own item.
- `strict-dynamic` (the #2 mitigation) **disables** origin allowlisting — can't hold both.
- CSP gates **loading**, does **not contain** a loaded plugin (full privileges: token/cache
  exfil via any allowed `connect-src`/`img`/`<a ping>`). Keep a **build-time exact-URL
  allowlist** (deploy-controlled, finer than origin) as complementary defense-in-depth.
- CSP↔settings drift is a two-control-plane failure: validate configured origins against the
  env CSP; surface CSP-blocked loads as a **distinct, observable** outcome.

**Hosting contract additions** (as written it silently fails on `raw.githubusercontent`-class
providers): correct **MIME types** (`application/javascript`, `application/json`); **CORS
`ACAO` on ALL assets** (manifest + remoteEntry + chunks, not just the manifest); **anonymously
readable, no credentials**; **dedicated single-tenant origin**; **no cross-origin redirects
unless every hop is allowlisted**; the required **CSP directive set is
plugin-capability-dependent** (`style`/`font`/`img`/`worker`/`connect-src`). Prefer a
**versioned-immutable manifest URL** — it eliminates TOCTOU and the double-fetch and removes
the need to revalidate (the "short/revalidate manifest" line otherwise *maximizes* TOCTOU).

**Functional (backend) coupling is unaddressed and ungated.** Discovery-decoupling ≠
functional-decoupling: the sales-rep plugin queries its xAPI; on a store without the BE
module it loads green (the CONTRACT GATE checks only facade `CORE_VERSION`) then fails at
runtime. **Decided — implement the gate** (nice-to-have): a `requiredBackendModules` /
capability precondition the host checks against the installed module list before load, and
reports `skipped` with a distinct reason when unmet (rather than a green load that fails at
first query).

**Prod-readiness gaps not yet designed** (most block *prod*, not the pilot):

- **Route authorization** — plugin `addRoute` has no permission/guard primitive in the
  facade; role-gating (sales-rep is rep-only) is likely a *pilot* blocker for real users.
- **Inter-plugin isolation** — route-path collisions, duplicate remote names, extension-key
  clobbering between plugins are unhandled (only host-vs-plugin isolation exists).
- **Kill switch** — the hardcoded pilot needs a **rebuild** to kill a bad plugin; gate any
  prod exposure on settings + CSP + integrity. Note store-settings propagation/cache latency.
- **Boot cost ∝ N** — all remotes are manifest-fetched / loaded / `init`'d eagerly before
  `app.use(router)`; add a lazy/route-triggered tier for non-critical plugins.
- **Route fallback** — deep links to a skipped/failed plugin route degrade to a generic
  routing failure; reserve host placeholder routes / a "feature unavailable" contract.
- **SSR/SEO** — `loadRemote` is client-side, so plugin routes are CSR-only (rules out MF for
  SEO-relevant public content; fine for authenticated sales-rep).
- **Plugin i18n** — no contract for a plugin to register translation messages / RTL.
- **Test strategy** — the new settings-driven `resolveRemotes` (sources, precedence, merge)
  and the "setThemeContext before startFederatedModules" ordering claim are untested.
- **Compat-drift governance** — no registry of plugin↔host versions / host-major breakage
  detection across N plugins.
- **Multi-store vs env granularity** — one env/backend serves many stores → per-store remote
  lists but a per-env ingress CSP that must allowlist the *union* of every store's origins.
- **Central `ModuleFederation` module** becomes a hard discovery dependency in every
  store/env (fail-closed to no-remotes if absent) — state it.

---

## 2. Artifact integrity for remote code

Remotes load over https from trusted hosting, but there is no integrity/signature check
on the manifest or chunks (MF has no native SRI story). This also covers the known
**TOCTOU** window: the gate fetches the manifest, then the MF runtime independently
fetches it again for loading (its cache is not publicly seedable) — a redeploy between
the two requests means validated ≠ executed, plus a second round trip per remote.
Evaluate: signed manifests, hash pinning, or CSP `strict-dynamic` + nonce approaches.
With settings-driven discovery (#1), the natural home for a pin is a per-remote `hash`
field on the setting entry — mirrors vc-shell's `entry.hash`.

**This is a prerequisite for enabling runtime discovery in prod, not a later hardening
pass** (review 2026-07-06): runtime, store-editable settings + a mutable origin otherwise
constitute a code-execution surface for whoever can edit the setting. Immutable **versioned
URLs** are the cheapest form — they also eliminate the TOCTOU window and the manifest
double-fetch outright.

---

## 3. Confirm the plugin-side story end to end

The harness is host-side only and ships no built-in remote, so the plugin contract is
exercised by unit tests (loader/gate/shared-config) but not by a living remote in CI.

**Want:** a minimal reference remote (separate build) that exposes `./plugin`, consumes
`@vc-frontend/core` + `REMOTE_SHARED`, declares `requiredHostVersion`, and is loaded in
an integration test. Locks the contract against regressions.

The intended first reference remote is the **sales-rep storefront plugin** (see #1 pilot),
so this item and the pilot converge. Partially covered already: `yarn create:plugin`
generates exactly such a remote and has been verified end to end (install, build, manifest
metadata, type-check). The remaining gap is wiring that generate-and-build cycle into CI,
plus a live `loadRemote` smoke against a running host.

When settings-driven discovery lands (#1), it needs its own coverage: the new
`resolveRemotes` logic (multi-source read, precedence truth table, name-collision dedup) and
a **guard test for the load-bearing ordering claim** — `setThemeContext(store)` must run
before `startFederatedModules()`, currently asserted but untested (review 2026-07-06).

---

## 4. Facade surface review

The current facade (`core-api/index.ts`) is intentionally minimal. As real plugins get
built, expect requests to widen it. Guard rails:

- Keep it **additive** — removing/renaming ⇒ breaking ⇒ `CORE_VERSION` bump.
- Every addition grows `dist/index.d.ts` and its transitive type graph — watch the size.
- Prefer exposing **composables/functions** over raw internals, so the implementation can
  change behind the facade without breaking the contract.

---

## Done (formerly deferred here)

- **Production error routing** — failed/skipped plugins are reported to Application
  Insights (`trackException` with plugin name, outcome and host core version) via the
  instance captured by `applicationInsights.plugin.ts`; best-effort no-op where
  AppInsights is not configured. DEV additionally shows a toast.

- **CI guard for the generated type contract** — `yarn validate:core-types` (part of
  `yarn validate`, which CI's `yarn build` runs) regenerates the contract and fails on
  drift; also checks `CORE_VERSION` ↔ `core-api/package.json` sync and that
  `federation.mjs` shared ranges stay compatible with host `package.json`.
- **Semver version gate** — `requiredHostVersion` accepts a version or range, evaluated
  with real semver, fail-closed on anything unparseable (was: custom dotted-numeric
  minimum-only compare).
- **Time budgets** — manifest fetch and plugin load/init are bounded so a hung remote
  degrades instead of blocking boot.
- **Shared-dep single source of truth** — `core-api/federation.mjs` (`HOST_SHARED` /
  `REMOTE_SHARED`), consumable by plugin builds as `@vc-frontend/core/federation`.

## Not doing (and why)

- **Out-clevering MF's shared-scope negotiation** — the shared singletons carry real
  semver ranges with `strictVersion: true`, so MF itself **throws** on a mismatch at
  `loadRemote()` (isolated per plugin by the loader), and the pre-execution manifest
  gate stays the outer fail-closed layer. We don't re-implement MF's negotiation on
  top; vc-shell dropped runtime version gating entirely (PR #228), we keep both layers.
- **Publishing `@vc-frontend/core` to an npm registry** — **not needed.** Earlier rationale
  ("the host is `private`") was wrong: `"private": true` only guards `npm publish`, not repo
  visibility, and the **repo is public**. So the contract distributes via a **pinned public
  git `#workspace=` / tarball reference** with no registry, token, or account, and **yalc**
  covers local co-dev (see *Facade distribution & local co-dev* in §1). A registry would add
  value only for very broad external distribution or non-Yarn consumers — and **GitHub
  Packages notably still requires a token even for public packages**, making it a poor fit for
  our no-secret / ADO-neutral goals. (Prior art: vc-shell publishes `@vc-shell/mf-*` to npm via
  OIDC Trusted Publishing — an option if we ever want registry-grade external distribution.)
