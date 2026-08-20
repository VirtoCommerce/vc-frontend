# Federated Modules (Module Federation host)

This folder is the **host side** of Module Federation (MF) for the storefront — the
code that discovers, version-checks, and loads **remote plugins** at runtime.

A "remote plugin" is a _separately built, separately deployed_ bundle (its own repo,
its own CI) that the storefront pulls in over HTTP at startup. It is **not** one of the
in-repo modules in `client-app/modules/*` — those ship inside the host bundle. The point
of MF is exactly that separation: a plugin team can build and release on their own cadence
without touching or rebuilding this repo.

> Jira: **VCST-5159**. Everything here is behind the `APP_MODULES_FEDERATION_ENABLED` flag and is a **no-op
> when the flag is off** — the harness ships with **zero built-in remotes**.

> **Want to BUILD a plugin?** Start with the step-by-step walkthrough:
> [`HOWTO.md`](./HOWTO.md). This file is the reference for how the host side works.

---

## TL;DR

```bash
# Serve the host WITH federation enabled, pointing at one or more remotes.
# build + preview is the canonical run (matches CI/prod); `yarn dev` also works and adds
# HMR (verified even for @apollo/client-sharing plugins) — use it as the iteration loop
# (HOWTO.md "The dev inner loop"). Use `--mode=development` locally so the store resolves
# from APP_BACKEND_URL — a prod-mode build resolves it from `localhost` and renders an
# empty page. See HOWTO.md step 4.
APP_MODULES_FEDERATION_ENABLED=true \
APP_MODULES_FEDERATION_REMOTES='{"news":"https://plugins.example.com/news/mf-manifest.json"}' \
yarn build-only --mode=development && yarn preview
```

- `APP_MODULES_FEDERATION_ENABLED` → turns the host into a federation host (build + runtime). Only
  `"true"`, `"1"`, `"yes"` or `"on"` enable it — any other value counts as off (allowlist:
  enabling remote code loading is the dangerous direction).
- `APP_MODULES_FEDERATION_REMOTES` → a JSON map of `remoteName → manifestUrl`. No var = no remotes = no-op.
  URLs must be **https** (http is allowed for localhost only).

> **Both vars are inlined at BUILD time** (Vite `import.meta.env`): changing the remote
> list means rebuilding the host, not just flipping a deployment variable. Runtime,
> settings-driven discovery is the planned replacement (see `TODO.md` #2 and
> `specs/2026-07-06-discovery-hosting-decision.md`; `APP_MODULES_FEDERATION_REMOTES` then stays as the
> local/dev override).

That's the whole operator surface. Everything below is _why_ and _how_.

---

## The big picture

```
┌─────────────────────────────────────────────────────────────────────┐
│  STOREFRONT HOST  (this repo)                                         │
│                                                                       │
│   app-runner.ts ──▶ startFederatedModules()  (bootstrap.ts)           │
│                          │                                            │
│                          ▼                                            │
│                     initFederatedModules()  (index.ts)                │
│                          │                                            │
│         ┌────────────────┼────────────────┐                          │
│         ▼                ▼                 ▼                          │
│   resolveRemotes()  version gate      loadRemote()                    │
│   (APP_MODULES_FEDERATION_REMOTES)  (isCompatible)    + plugin.init()                 │
│                                                                       │
│   exposes the shared facade  ▶  @vc-frontend/core  (live instance)    │
└───────────────────────────────────────────────┬───────────────────────┘
                                                 │  HTTP  (mf-manifest.json,
                                                 │        remoteEntry.js, chunks)
                    ┌────────────────────────────┴───────────────┐
                    ▼                                             ▼
        ┌────────────────────────┐                  ┌────────────────────────┐
        │  REMOTE PLUGIN "news"  │                  │  REMOTE PLUGIN "foo"   │
        │  exposes ./plugin      │                  │  exposes ./plugin      │
        │  init() { addRoute…}   │                  │  init() { … }          │
        │                        │                  │                        │
        │  imports host services │                  │  imports host services │
        │  via @vc-frontend/core │                  │  via @vc-frontend/core │
        └────────────────────────┘                  └────────────────────────┘
```

**How host and remotes find each other:** the host holds a list of remotes
(`APP_MODULES_FEDERATION_REMOTES`). Each entry points at the plugin's `mf-manifest.json`, a small JSON
index that tells the MF runtime where the plugin's code (`remoteEntry.js` + chunks) lives.
The host reads that manifest, checks compatibility, then loads the plugin's `./plugin`
entry and calls its `init()`. The plugin, in turn, reaches back into the host **only**
through the shared `@vc-frontend/core` facade — never by importing host source directly.

---

## The shared facade — the only bridge

A plugin must not `import "@/..."` from the host — those paths don't exist in the
plugin's build. Instead, the host publishes a **curated public surface** as the package
`@vc-frontend/core` (source: `client-app/core-api/`). This is the _single_ seam between
host and plugin.

Two halves, and they are deliberately different:

|                              | Plugin gets…                                                                | From…                                             |
| ---------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------- |
| **At build/type-check time** | **Types only** — a self-contained `contract/index.d.ts`                         | `yarn build:core-types` output, committed         |
| **At runtime**               | The host's **live singleton instance** (real router, real Apollo client, …) | MF shared scope (`shareStrategy: "loaded-first"`) |

This is "publish from source": the plugin compiles against a frozen type contract and
gets zero host coupling, while at runtime it shares the exact same live objects as the
host. No second Vue, no second router, no duplicate Apollo cache.

**Current facade surface** (see `client-app/core-api/index.ts` for the authoritative list):

- UI (22 components): `VcAlert`, `VcBadge`, `VcBreadcrumbs`, `VcButton`, `VcCheckbox`,
  `VcEmptyView`, `VcIcon`, `VcImage`, `VcInput`, `VcLabel`, `VcLink`, `VcLoaderOverlay`,
  `VcMarkdownRender`, `VcMenuItem`, `VcModal`, `VcSelect`, `VcTable`, `VcTableColumn`,
  `VcTextarea`, `VcTypography`, `VcWidget`, `VcWidgetSkeleton` (`VcImage` is host-bound too —
  its thumbnail logic reads theme settings through a getter that throws until the host sets the
  theme context, so only a filename-only `src` renders standalone); the themed `OrderStatus`
  (host-only — its colours come from the THEME's `orders_statuses` in
  `config/settings_data.json`, which no query serves, and it throws until the host has set the
  theme context, so it renders inside the host and nowhere else); and `uiKit`, the plugin that
  registers every `Vc*` globally (all `Vc*` are already registered inside the host)
- Extension points: `useExtensionRegistry`, `EXTENSION_NAMES`
- Data: `apolloClient`, `graphqlClient`, `registerCacheTypePolicies`,
  `SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT`
- Composables: `useUser`, `useNavigations`, `useModal`, `useNotifications`, `useBreadcrumbs`,
  `usePageHead`, `useWishlistSharingScopes`
- Config / utilities: `useModuleSettings`, `globals`, `Logger`, `getProductRoute`,
  `toStartDateFilterValue`, `toEndDateFilterValue`, `registerLocaleLoader`, `ROUTES` (the host
  route names a plugin mounts under or links to)
- Meta: `CORE_VERSION`, and the types `I18n`, `ILanguage`, `LocaleLoaderType`, `MenuType`,
  `ExtendedMenuLinkType`, `IWishlistSharingScopeControlsType`,
  `WishlistSharingScopeSavedContextType`
- Separate subpaths: `@vc-frontend/core/federation`, `/tailwind-preset`, `/testing`

> **Rule of thumb:** keep the facade **small and additive**. The level depends on the
> release line: on 0.x a new export ⇒ **patch** and removing/renaming ⇒ **minor**; from
> 1.0.0 it is the ordinary minor/major. Either way, removing/renaming breaks _every_ plugin.
> **How to add an export, and how the `.d.ts` generation works:**
> [`client-app/core-api/README.md`](../../core-api/README.md).

The shared **singletons** (what must be one-instance-only across host+plugins) live in
`client-app/core-api/federation.mjs` — the **single source of truth for both sides**:
`vue`, `vue-router`, `vue-i18n`, `@vueuse/core`, `@apollo/client`,
`@vue/apollo-composable`, `graphql`, and `@vc-frontend/core` itself, each with a real
semver `requiredVersion` range (kept consistent with the host `package.json` by a
build-types guard) and `strictVersion: true` — a range mismatch makes MF **throw at
`loadRemote()`** (isolated to that plugin) instead of the default console warning.
The host build consumes `createHostShared()` (via `vite.federation.ts`); a plugin
build calls `createRemoteShared()` from `@vc-frontend/core/federation` — its
`import: false` stops the remote from bundling multi-MB fallback copies. Both accept
per-package **overrides** (adjust a range, add a package, drop one with `false`), so
the defaults never lock a consumer in. Mirrors vc-shell's `@vc-shell/mf-config`
package.

> The package root is **types-only** — there is deliberately no runtime entry. A plugin
> build that forgot to mark it shared, or node tooling resolving it directly, fails
> immediately at resolution time (`ERR_PACKAGE_PATH_NOT_EXPORTED`); only the type
> contract and `./federation` are directly consumable.

---

## The two version gates

There are deliberately **two** version checks, guarding **different failure classes** —
don't "simplify" one away:

|            | 1 · CONTRACT GATE                                         | 2 · SHARED-DEPENDENCY GATE                                            |
| ---------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| Guards     | the **facade API contract** (`@vc-frontend/core` surface) | **each shared library** (vue, @apollo/client, …)                      |
| Question   | "was this plugin built against a compatible host API?"    | "do the host-provided singletons satisfy the plugin's ranges?"        |
| Input      | manifest `metaData.requiredHostVersion` vs `CORE_VERSION` | plugin's shared config (`createRemoteShared` ranges) vs host versions |
| When       | **before any plugin code executes** (manifest JSON only)  | during `loadRemote()`, MF shared-scope negotiation                    |
| On failure | remote **skipped** (fail closed)                          | remote **failed** (MF throws via `strictVersion`; isolated)           |
| Code       | `version-gate.ts` (+ `isCompatible` in `index.ts`)        | `core-api/federation.mjs` (`strictVersion: true`)                     |

One can pass while the other fails: a plugin can require the right facade version yet
be built against a different Vue major (gate 1 passes, gate 2 throws), or ship the
right Vue range but use a facade export this host doesn't have (gate 2 passes, gate 1
skips). vc-shell has **neither** as a hard stop (its shared mismatches only warn) —
it can afford that because everything flows through published npm semver; we can't.

How can a plugin even disagree with the host about Vue, when it borrows the host's
Vue at runtime? Because **borrowing happens at runtime only**: at build time the
plugin compiles, type-checks and SFC-compiles against its **own** installed packages,
and separate build cadences (the whole point of MF) mean a year-old plugin artifact
can meet a host that upgraded a shared dependency yesterday. The gate doesn't prevent
that skew — it makes it loud and isolated instead of silently corrupting.

---

## The load sequence (what actually happens at boot)

```
app-runner.ts
  │  const ready = startFederatedModules();   // fire early, don't await yet
  │  … other boot work …
  │  await ready;                             // BEFORE app.use(router)
  ▼
startFederatedModules()            bootstrap.ts
  │  if (!APP_MODULES_FEDERATION_ENABLED) return;              ← flag off ⇒ instant no-op
  │  dynamic import("./index")              ← keeps MF runtime out of non-MF builds
  ▼
initFederatedModules()             index.ts
  1. resolveRemotes()              parse + validate APP_MODULES_FEDERATION_REMOTES → [{name, entry}]
                                   (empty ⇒ done; non-string / non-https / non-".json"
                                   entries are reported as SKIPPED, never silently dropped)
  2. isCompatible(remote)          fetch manifest JSON (3s budget), evaluate
                                   requiredHostVersion (semver version or RANGE) against
                                   CORE_VERSION. Incompatible, malformed, unreadable or
                                   timed out ⇒ SKIP (fail closed — no plugin code has run)
  3. registerRemotes(compatible)   { force: true } so HMR re-registration won't throw
  4. loadRemote(`${name}/plugin`)  ⇒ plugin module ⇒ await plugin.init()  (5s budget each)
  5. Promise.allSettled            one bad plugin cannot abort the others
  6. reportOutcome({loaded,failed,skipped})   logs (Logger is live in dev, no-op in prod)
```

In production `Logger` is a no-op, so failed/skipped plugins currently surface through
the loader's returned outcome only — there is no telemetry signal yet. Reporting
outcomes to Application Insights (`trackException` for **failed** — something broke; a
`trackEvent` for **skipped** — a gate doing its job, kept out of the exceptions blade
so it cannot drown real failures) is a tracked stage-2 follow-up in `TODO.md`; the
harness fails closed and ships without it. It requires bridging the AppInsights
instance to boot-time code (the library's `useAppInsights()` is inject-based and
unusable from a loader that runs before the plugin installs).

Three design points worth calling out:

- **Awaited before `app.use(router)`** so a plugin that calls `router.addRoute()` in
  `init()` is registered _before_ the initial navigation resolves — deep links to
  plugin routes work on first paint.
- **Version gate runs before any remote code executes.** We fetch the manifest (plain
  JSON, no execution), read `metaData.requiredHostVersion`, and only `loadRemote` the
  ones this host can satisfy. Missing, unreadable, or unparseable ⇒ treated as
  incompatible (fail closed) — a plugin must declare `requiredHostVersion` to run
  (`createRemoteFederationOptions` makes it mandatory). A bare version like `"1.0.0"` is
  normalized to `"^1.0.0"` — so a host **major** bump correctly rejects plugins built
  against the previous major. While the contract is pre-1.0 the **minor** carries that role
  instead: `^0.1.0` accepts `0.1.x` and refuses `0.2.0`.
- **Every network step is time-budgeted** (two knobs via `initFederatedModules(options)`:
  manifest 3s; load and init 5s _each_ — one remote may legally take up to
  manifest + 2×load ≈ 13s). Because boot awaits this loader, a hung remote must degrade
  to a `failed`/`skipped` plugin — never a blank storefront. `bootstrap.ts` adds a
  20s **backstop** above that sum, covering what the budgets cannot (the loader chunk
  fetch itself hanging, an inner timeout malfunctioning) — a remote operating within
  its budgets never trips it, preserving the deep-link guarantee. Containment
  semantics: a `loadRemote` that resolves _after_ its budget never gets its `init()`
  called; an `init()` that already started cannot be cancelled — the plugin is reported
  `failed`, and any late settlement (success or the real failure cause) is logged as
  **indeterminate** so the outcome is never silently contradicted.

---

## Writing a plugin (remote side)

A plugin is its own build. It must:

1. **Expose `./plugin`** resolving to a module shaped like:

   ```ts
   // the contract the host expects (see IFederatedPlugin in index.ts)
   export function init(): void | Promise<void> {
     // register routes, extension points, etc. — using @vc-frontend/core
   }
   ```

2. **Depend on `@vc-frontend/core` for anything host-provided**, and reuse the host's
   shared-singleton map instead of hand-maintaining one — a forgotten entry silently
   ships a second Vue:

   ```ts
   // plugin vite.config.ts - one call, conventions owned by the host
   import { createRemoteFederationOptions } from "@vc-frontend/core/federation";

   federation(
     createRemoteFederationOptions({
       name: "news",
       requiredHostVersion: "^0.1.0", // CONTRACT GATE input, stamped into the manifest
     }),
   );
   ```

   The defaults are overridable per package — adjust a field, add a plugin-provided
   shared lib, or drop an entry with `false`:

   ```ts
   shared: createRemoteShared({
     vue: { requiredVersion: "^3.6.0" },            // adjust a default
     "my-chart-lib": { requiredVersion: "^5.0.0" }, // add (plugin provides it)
     graphql: false,                                // remove
   }),
   ```

3. **Declare the host version it needs** in its manifest — a semver **version or range**:

   ```jsonc
   // mf-manifest.json (excerpt)
   { "metaData": { "requiredHostVersion": "^0.1.0" } }
   // a bare "0.1.0" means the same thing (normalized to ^0.1.0);
   // anything semver can't parse is rejected (fail closed)
   ```

### Sketch of a plugin `init()`

Conceptually identical to an in-repo module's `init()` (compare `modules/news/index.ts`),
except imports come from the facade:

```ts
import { useExtensionRegistry, apolloClient } from "@vc-frontend/core";
// note: NO `@/...` imports — those don't exist in the plugin build

const MyPage = () => import("./pages/MyPage.vue");

export function init() {
  // add a route, register into an extension point, wire data, …
  useExtensionRegistry().register(/* … */);
}
```

Once built and deployed, add it to the host's `APP_MODULES_FEDERATION_REMOTES` and it loads on next boot.

---

## Files in this folder

| File              | Role                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bootstrap.ts`    | App-runner entry. Flag check + dynamic import of the loader (both failure-proof). **No static MF-runtime import** — so non-MF builds bundle neither the runtime nor the loader. |
| `index.ts`        | The loader: resolve+validate remotes → version gate → `registerRemotes` → `loadRemote`/`init` (time-budgeted) → report. Contains the `IFederatedPlugin` contract.               |
| `version-gate.ts` | The CONTRACT GATE: fail-closed semver check of `requiredHostVersion` (version or range) against the facade version.                                                             |
| `*.test.ts`       | Unit tests for the loader, the gate, bootstrap and the shared-dep contract.                                                                                                     |

**Related files outside this folder:**

| File                                 | Role                                                                                                                                                                                                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client-app/core-api/federation.mjs` | **Single source of truth** for the shared-singleton contract: `createHostShared`/`createRemoteShared` (+ `HOST_SHARED`/`REMOTE_SHARED` defaults), `isMfFlagEnabled`. Plain `.mjs` so plugin vite configs (node) and browser code can both import it. |
| `vite.federation.ts` (repo root)     | Build-side host config: `federatedHostPlugin` (consumes `createHostShared()`), `federatedAlias`. At root because it imports a build-time dev dep.                                                                                                    |
| `client-app/core-api/`               | The `@vc-frontend/core` facade + the `build-types.mjs` type-contract build.                                                                                                                                                                          |
| `client-app/app-runner.ts`           | Calls `startFederatedModules()` and awaits it before `app.use(router)`.                                                                                                                                                                              |

---

## Environment variables

| Var              | Scope                | Meaning                                                                                                              |
| ---------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `APP_MODULES_FEDERATION_ENABLED`    | build time (inlined) | Enables the MF host plugin in Vite **and** the runtime bootstrap. Off (unset/`""`/`"false"`/`"0"`) ⇒ complete no-op. |
| `APP_MODULES_FEDERATION_REMOTES` | build time (inlined) | JSON `{ "<name>": "<manifestUrl>" }`, https-only. Absent/invalid ⇒ no remotes loaded.                                |

---

## Security model (read before enabling in production)

A federated plugin executes with **full application privileges** — same origin, same
session, same Apollo client. Treat the remote list as part of the deploy artifact, not
as tenant-editable configuration. What the harness enforces today:

- **https-only remotes** (http allowed for loopback only: `localhost` / `127.0.0.1` /
  `[::1]`) — no downgradable code loads.
- **Fail-closed gating** — a manifest that can't be fetched, parsed or version-matched
  never gets its code executed.
- **Build-time remote list** — an attacker can't add a remote without producing a new
  host build (this is a temporary property; see the central-discovery TODO, which must
  come with an origin allowlist).

What **you** must provide when enabling MF in an environment:

- **CSP**: add each plugin origin to `script-src` and `connect-src` (manifest fetch +
  chunk loading). Without CSP, any XSS can `import()` arbitrary code anyway — CSP is the
  real boundary that makes the https/allowlist story meaningful.
- **Trusted hosting** for plugin artifacts (same trust level as the host bundle itself);
  artifact integrity/signing is an open follow-up in `TODO.md`.

Known limitation (documented, accepted for now): the gate fetches the manifest itself,
and the MF runtime fetches it **again** for loading — a remote redeployed between the
two requests means the manifest that was validated is not guaranteed to be the one
executed (TOCTOU), and remote boot pays a second round trip. The MF runtime exposes no
public way to seed its manifest cache; the real fix is hash-pinned artifacts in the
central-discovery response (see `TODO.md` #3 — vc-shell already passes `entry.hash`).

---

## Gotchas & guarantees

- **Off by default.** No flag, no cost — the loader isn't even imported.
- **Isolation is total.** `initFederatedModules()` never rejects; a failing plugin is
  logged and reported, others still load. A hung remote is cut off by the time budgets.
- **Fail closed on version.** Can't read/parse/satisfy a manifest ⇒ skip that remote.
- **The `.d.ts` is generated and drift-guarded.** After any facade change, run
  `yarn build:core-types` and commit `client-app/core-api/contract/index.d.ts` (zero `@/`
  references, checked). `yarn validate` (and therefore CI `yarn build`) runs
  `validate:core-types`, which regenerates the contract and **fails if the committed
  file is stale** — same for `CORE_VERSION`/package.json sync and shared-range drift.
- **`CORE_VERSION` is single-sourced** from `core-api/package.json` and managed by
  the contract build: additive facade changes auto-bump (patch on 0.x, minor from 1.0.0);
  breaking ones require an explicit `yarn bump:core <breaking level>` (minor on 0.x, major
  from 1.0.0) — **including a major bump of a shared singleton** (vue,
  @apollo/client, …): plugins pin against the facade version, so a breaking shared
  dep must surface there.

See [`TODO.md`](./TODO.md) for what's intentionally deferred (remote discovery via a
central manifest, artifact integrity, a reference plugin in CI, etc.).
