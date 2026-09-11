# MF plugin discovery, hosting & enablement — decision record (VCST-5159)

**Status:** decided 2026-07-06. The **facade-distribution part is implemented** (see
[`2026-07-06-facade-distribution-design.md`](./2026-07-06-facade-distribution-design.md)
and the delivery status below).

> **The discovery half is SUPERSEDED (2026-08).** The platform shipped module-served discovery
> (x-api 3.1016.0 / x-frontend 3.1005.0) and the loader consumes it — so the central
> `ModuleFederation.Remotes` store setting decided below, its dedicated platform module, and the
> "`AppManifestService` only later, as an additional source" call were all dropped. Current state:
> [`../TODO.md`](../TODO.md) #2. Everything below is kept for the *why* and for review
> traceability; read it as history, not as the plan.

Open work items live in [`../TODO.md`](../TODO.md); this file is the *why and what was
decided*, kept for context and review traceability.

---

## The constraint that forced a decision

`APP_MODULES_FEDERATION_ENABLED` / `APP_MODULES_FEDERATION_REMOTES` are read from `import.meta.env`, **inlined at build
time** — so one theme artifact carries one hardcoded plugin list and on/off state. That
doesn't compose with how environments are configured: `vc-deploy-dev` is ArgoCD +
Kustomize, where per-env values (DB host, `VirtoCommerce__Endpoint__Url`, the SPA zip via
`MERCURY_THEME_URL`) are injected as **runtime** ConfigMap values per overlay. A
build-time-inlined bundle can't read those — QA and DEV can't load different plugins from
the *same promoted artifact* without a separate build per env. The decision below removes
that.

**Decision in one line:** resolve the enable-flag + remote list at **runtime from platform
Store settings**, per environment; host each plugin artifact on **any origin that meets a
fixed contract** (provider-agnostic); guard with the **CSP**. No new backend module for the
first plugin.

## Discovery — platform Store settings (runtime, per-env)

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
back through a BE module's settings would create exactly the dependency this design avoids.
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

## Enablement — three levels, no `APP_MODULES_FEDERATION_ENABLED`

- **Theme master switch** → a flag in `client-app/config/settings_data.json` (theme config,
  read via `useThemeContext` at boot). Replaces only the **runtime** role of `APP_MODULES_FEDERATION_ENABLED`.
  ⚠️ It does **not** replace `APP_MODULES_FEDERATION_ENABLED`'s **build-time** role (the Vite
  `federatedHostPlugin`, `vite.config.ts` / `vite.federation.ts`, which decides whether
  the MF runtime is bundled at all) — see *Review findings* below.
- **Runtime per-env** → the store setting (`Enabled` + the list).
- **Local/dev override & pilot hardcode** → `APP_MODULES_FEDERATION_REMOTES` (kept — lets a frontender
  point at `localhost:3001` with no backend setting, and is how the first plugin is wired
  *before* settings-driven discovery exists). **Decided:** when set, `APP_MODULES_FEDERATION_REMOTES`
  **overrides** the runtime setting (a true local/dev override — it does not lose to it).
- **Seams:** the flag check in `bootstrap.ts` and `resolveRemotes()` in `index.ts` — the
  only spots reading `import.meta.env.APP_MODULES_FEDERATION_*` today.

## Hosting — provider-agnostic contract (decoupled from discovery)

The setting holds a **URL**; the host never knows or cares who serves it — so hosting is
**provider-agnostic by construction**. Any origin qualifies if it meets this contract:

- static serving (no SSR), **https**, **CORS `ACAO` on ALL assets** (manifest +
  remoteEntry + chunks, not just the manifest);
- correct **MIME types** (`application/javascript`, `application/json`);
- **anonymously readable, no credentials**; **no cross-origin redirects** unless every
  hop is allowlisted;
- **immutable cache on content-hashed chunks**; prefer a **versioned-immutable manifest
  URL** (eliminates the TOCTOU window and the manifest double-fetch — a short/revalidate
  manifest *maximizes* TOCTOU);
- browser-reachable and **allowlisted in the CSP** (the required directive set is
  plugin-capability-dependent: `style`/`font`/`img`/`worker`/`connect-src`);
- plugin built with `publicPath: "auto"`.

The artifact is **not** shipped in the BE module zip (vc-shell's convention) — that would
couple FE releases to module releases and force frontenders to run the platform locally
(see *Separation of concerns* below). Providers are interchangeable **examples that satisfy
the contract**, chosen per-env via the setting URL — jsDelivr / GitHub Pages (pilot &
dev/QA), Cloudflare Pages / Azure Static Web Apps / Blob+CDN / own CDN (prod). Run one in
QA and another in prod with zero host change.

## Facade distribution & local co-dev — decided AND implemented

How the separate-repo plugin gets `@vc-frontend/core` (types + `federation.mjs` + tailwind
preset — all **build-time**; the runtime instances are injected by MF, nothing to serve). The
host repo is **public** (`package.json "private": true` only blocks `npm publish`, not repo
visibility), so **no registry, token, or account is needed**:

- **Committed / CI: a versioned tarball URL.** A **manual (`workflow_dispatch`) release
  workflow** (`.github/workflows/core-facade-release.yml`) runs `npm pack` in `core-api` →
  `vc-frontend-core-<CORE_VERSION>.tgz`, uploaded as a **GitHub Release asset** tagged
  `core-v<CORE_VERSION>`; the plugin pins that URL (`yarn create:plugin` generates the pin;
  the lockfile records the tarball checksum). Public ⇒ **no token to consume**, works on
  ADO/GitHub/anywhere, PM-agnostic, tiny, versions coexist. Releases are **immutable per
  version** (re-release refused; drift-checked before packing).
  - *Rejected:* hosting the tarball in the storefront's `dist` / served theme assets — that
    ties the plugin's *build* to a *deployed* storefront env and makes the contract version
    track the deployment instead of an immutable release. The tarball must be a **release
    artifact, not a file served by a running storefront**.
  - *Fallback:* Yarn `#workspace=@vc-frontend/core` git link — no publish step, but clones
    the whole (large) storefront repo per install and is Yarn-Berry-only.
- **Local co-dev (editing the host facade + plugin together, unpushed):** **yalc** —
  `yalc publish --private` in `core-api` → `yalc add @vc-frontend/core` in the plugin →
  `yarn core:yalc-push` on change. Purely local/offline (`~/.yalc` store): **no tokens,
  accounts, or registry**, and bundler-robust (copies real files — no symlink
  duplicate-instance footgun). Don't commit `.yalc/` or the injected `file:` dep;
  `yalc remove` + restore the pinned reference before pushing. (vc-shell solves the same
  problem with an automated `portal:` rewrite script — `scripts/setup-app.ts` /
  `yarn setup:apps` — which flips `@vc-shell/*` deps to `portal:` local paths +
  `preserveSymlinks` and reverts via `unsetup:apps`; yalc is the clearer, secret-free
  equivalent for us.)

Implementation details, verification, and the tarball-safety fix to the tailwind preset
(the old preset only resolved from a host checkout — caught by installing the real
tarball, now a generated self-contained snapshot whose changes auto-bump `CORE_VERSION`):
see [`2026-07-06-facade-distribution-design.md`](./2026-07-06-facade-distribution-design.md).

## Security guard — the CSP is the allowlist (necessary, NOT sufficient)

Once the list is runtime data, "who can register a code-executing remote" needs a guard
**above** store-settings-edit. That guard is the **CSP**, set at the **vc-deploy nginx
ingress** (per-env, git+PR-controlled, browser-enforced): the browser refuses to
fetch/execute from any origin not in `script-src` / `connect-src`, so a bad setting entry
can't load. **Not a build-time frontend allowlist** (a runtime-data list guarded by a
runtime-data list is no guard). It is never a `vc-frontend` repo change.

The 2026-07-06 review qualified the claim — CSP alone is not sufficient:

- **Shared-CDN origins collapse an origin-only allowlist** — anyone who can write the
  setting points `url` at another path on the same allowlisted host
  (`cdn.jsdelivr.net/gh/attacker/…`). **Decided (no dedicated origin required):**
  *path-scope* the CSP to our namespace (e.g.
  `script-src https://cdn.jsdelivr.net/gh/VirtoCommerce/`) at the ingress, paired with
  **versioned-immutable URLs** (CSP path matching is weakened by redirects; a pinned
  version has none). Hash pinning is the airtight form. **Not needed for the pilot** —
  the hardcoded `APP_MODULES_FEDERATION_REMOTES` list is build-controlled, so shared CDNs are safe there.
  Dedicated origins / `*.plugins.example.com` only if we outgrow path-scoping.
- **A *tight* base CSP does not exist today** (GA4/Hotjar/inline scripts) — hardening it
  (no `unsafe-inline`, no wildcard) is a **from-zero project on the prod critical path**,
  not an annotation. Tracked as its own TODO item.
- `strict-dynamic` (an integrity-item mitigation) **disables** origin allowlisting —
  can't hold both.
- CSP gates **loading**, does **not contain** a loaded plugin (full privileges:
  token/cache exfil via any allowed `connect-src`/`img`/`<a ping>`). Keep a **build-time
  exact-URL allowlist** (deploy-controlled, finer than origin) as complementary
  defense-in-depth.
- CSP↔settings drift is a two-control-plane failure: validate configured origins against
  the env CSP; surface CSP-blocked loads as a **distinct, observable** outcome.

Consequence: **CSP is a hard prerequisite for enabling MF in prod**, and it does not exist
in the reference stack today (no security headers at all). Enabling MF means introducing
it — nginx `configuration-snippet` annotation, or the controller custom-headers ConfigMap
if snippet annotations are locked down.

## Separation of concerns / local dev (why this shape)

- **FE releases independently:** the plugin builds + deploys on its own cadence to its own
  origin; the BE module ships the settings descriptor **once**; thereafter the URL value
  (runtime setting) and the artifact (external host) change with **no module release**.
- **Local dev needs no backend/module:** frontenders run only the plugin
  (`yarn preview` → `:3001`) + the storefront with `APP_MODULES_FEDERATION_REMOTES`, pointed at a **shared
  remote backend** via `APP_BACKEND_URL` (as `.env.local` already does). No local platform,
  no local module.

## Pilot — `vc-module-sales-rep` (doubles as the reference remote)

sales-rep is full-stack (Core/Data + xAPI + a vc-shell backoffice app). Its storefront
plugin is a **new, separate** frontend in **its own repo** (built vs `@vc-frontend/core`,
exposes `./plugin`, declares `requiredHostVersion`) — **not** the existing backoffice
`Web/App`, and **not** shipped from the BE module.

**For the pilot, hardcode the remote** via the existing build-time `APP_MODULES_FEDERATION_REMOTES` path —
no store settings, no platform module, no new plumbing. That is enough to prove the full
loop (build → host → gate → `loadRemote` → `init`) end-to-end. The settings-driven central
list is the target *once the loop is proven*; it is **not** a prerequisite for the pilot.

## Review findings (2026-07-06) — corrections to the design

A multi-agent, code-verified architecture review confirmed every claim about *current* code
(boot order, seams, facade, GA4/Hotjar precedent) and produced these corrections (the open
gaps it found are tracked in `TODO.md`):

- **`settings_data.json` does not fully replace `APP_MODULES_FEDERATION_ENABLED`:** the build-time bundling
  gate must also read the flag (`vite.federation.ts` — Node can import the JSON), **or** a
  build-time switch survives. Frame the theme flag as *build-time-by-necessity for runtime
  bundling*; per-env on/off is the store `Enabled` flag.
- **The registry entry is not `{name,url}`.** It already needs `enabled`, will need `hash`
  (integrity) and `source`, plus AppManifestService fields. Define a **versioned normalized
  descriptor** `{ name, url, enabled, version?, requiredHostVersion?, hash?, source }` with
  per-source adapters so source-specific fields don't leak into the host.
- **Precedence is underspecified.** Define one canonical `resolveRemotes()` resolution + a
  truth table over {theme switch × store `Enabled` × store list × `APP_MODULES_FEDERATION_REMOTES`}:
  present-vs-empty, replace-vs-merge, and **name-collision dedup**
  (`registerRemotes({force:true})` silently overrides a duplicate — since corrected: `force` is no
  longer passed, because without it a known name is a no-op while `force` tears the remote down and
  re-runs its `init()`). **Decided:** local
  `APP_MODULES_FEDERATION_REMOTES` **overrides** the runtime setting (true dev/local override).
- **Say "provider/hosting-agnostic," not "host-agnostic."** Authoring is coupled to this
  host's `@vc-frontend/core` + `./plugin` + `requiredHostVersion`; external authorship
  stays first-party-scoped for now. Discovery is **platform-bound** (store settings /
  AppManifestService are VC channels; the host hardcodes the module id + setting key):
  decoupled from plugin *modules*, not from the backend control plane. "Independent
  cadence" holds for minor/patch; shared-singleton **major** bumps are coordinated
  (breaks all plugins until rebuild).
- **Functional (backend) coupling needs a gate.** Discovery-decoupling ≠
  functional-decoupling: the sales-rep plugin queries its xAPI; on a store without the BE
  module it loads green (the CONTRACT GATE checks only facade `CORE_VERSION`) then fails
  at runtime. **Decided — implement** a `requiredBackendModules` / capability precondition
  checked against the installed module list before load, reported as `skipped` with a
  distinct reason (tracked in `TODO.md`).

## Delivered with the harness (formerly TODO items)

- **Failure visibility (dev)** — failed/skipped plugins are logged with per-plugin
  reasons (Logger is live in dev builds, a no-op in prod). Production telemetry routing
  (Application Insights) is not part of the harness — `Logger` is a no-op in prod — and
  is tracked in `TODO.md` as a stage-2 observability follow-up (the harness fails
  closed and ships without it).
- **CI guard for the generated type contract** — `yarn validate:core-types` (part of
  `yarn validate`, which CI's `yarn build` runs) regenerates the contract and fails on
  drift; also checks that `federation.mjs` shared ranges stay compatible with host
  `package.json`. The same guard covers the generated tailwind preset.
- **Semver version gate** — `requiredHostVersion` accepts a version or range, evaluated
  with real semver, fail-closed on anything unparseable.
- **Time budgets** — manifest fetch and plugin load/init are bounded so a hung remote
  degrades instead of blocking boot.
- **Shared-dep single source of truth** — `core-api/federation.mjs` (`HOST_SHARED` /
  `REMOTE_SHARED`), consumable by plugin builds as `@vc-frontend/core/federation`.
- **Facade distribution** — tarball Release asset + release workflow + tarball-pinning
  scaffolder + yalc co-dev (see the facade spec).

## Not doing (and why)

- **Out-clevering MF's shared-scope negotiation** — the shared singletons carry real
  semver ranges with `strictVersion: true`, so MF itself **throws** on a mismatch at
  `loadRemote()` (isolated per plugin by the loader), and the pre-execution manifest
  gate stays the outer fail-closed layer. We don't re-implement MF's negotiation on
  top; vc-shell dropped runtime version gating entirely (PR #228), we keep both layers.
- **Publishing `@vc-frontend/core` to an npm registry** — **not needed.** Earlier rationale
  ("the host is `private`") was wrong: `"private": true` only guards `npm publish`, not repo
  visibility, and the **repo is public**. The contract distributes via the pinned tarball
  Release asset with no registry, token, or account, and **yalc** covers local co-dev. A
  registry would add value only for very broad external distribution or non-Yarn
  consumers — and **GitHub Packages notably still requires a token even for public
  packages**, a poor fit for the no-secret / ADO-neutral goals. (Prior art: vc-shell
  publishes `@vc-shell/mf-*` to npm via OIDC Trusted Publishing — an option if we ever
  want registry-grade external distribution.)
