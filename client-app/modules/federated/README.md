# Federated Modules (Module Federation host)

This folder is the **host side** of Module Federation (MF) for the storefront — the
code that discovers, version-checks, and loads **remote plugins** at runtime.

A "remote plugin" is a *separately built, separately deployed* bundle (its own repo,
its own CI) that the storefront pulls in over HTTP at startup. It is **not** one of the
in-repo modules in `client-app/modules/*` — those ship inside the host bundle. The point
of MF is exactly that separation: a plugin team can build and release on their own cadence
without touching or rebuilding this repo.

> Jira: **VCST-5159**. Everything here is behind the `APP_MF_HOST` flag and is a **no-op
> when the flag is off** — the harness ships with **zero built-in remotes**.

---

## TL;DR

```bash
# Build/serve the host WITH federation enabled, pointing at one or more remotes:
APP_MF_HOST=true \
APP_MF_REMOTES='{"news":"https://plugins.example.com/news/mf-manifest.json"}' \
yarn dev
```

- `APP_MF_HOST` → turns the host into a federation host (build + runtime).
- `APP_MF_REMOTES` → a JSON map of `remoteName → manifestUrl`. No var = no remotes = no-op.

That's the whole operator surface. Everything below is *why* and *how*.

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
│   (APP_MF_REMOTES)  (isCompatible)    + plugin.init()                 │
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
(`APP_MF_REMOTES`). Each entry points at the plugin's `mf-manifest.json`, a small JSON
index that tells the MF runtime where the plugin's code (`remoteEntry.js` + chunks) lives.
The host reads that manifest, checks compatibility, then loads the plugin's `./plugin`
entry and calls its `init()`. The plugin, in turn, reaches back into the host **only**
through the shared `@vc-frontend/core` facade — never by importing host source directly.

---

## The shared facade — the only bridge

A plugin must not `import "@/..."` from the host — those paths don't exist in the
plugin's build. Instead, the host publishes a **curated public surface** as the package
`@vc-frontend/core` (source: `client-app/core-api/`). This is the *single* seam between
host and plugin.

Two halves, and they are deliberately different:

| | Plugin gets… | From… |
|---|---|---|
| **At build/type-check time** | **Types only** — a self-contained `dist/index.d.ts` | `yarn build:core-types` output, committed |
| **At runtime** | The host's **live singleton instance** (real router, real Apollo client, …) | MF shared scope (`shareStrategy: "loaded-first"`) |

This is "publish from source": the plugin compiles against a frozen type contract and
gets zero host coupling, while at runtime it shares the exact same live objects as the
host. No second Vue, no second router, no duplicate Apollo cache.

**Current facade surface** (see `client-app/core-api/index.ts` for the authoritative list):

- UI: `VcWidget`, `VcButton`, `VcMarkdownRender` (all `Vc*` are also globally registered)
- Extension points: `useExtensionRegistry`
- Data: `apolloClient`, `graphqlClient`
- Config: `useModuleSettings`, `globals`
- Meta: `CORE_VERSION`, `type I18n`

> **Rule of thumb:** keep the facade **small and additive**. Removing or renaming an
> export is a breaking change for *every* plugin — bump `CORE_VERSION` when you do.

The shared **singletons** (what must be one-instance-only across host+plugins) live in
`vite.federation.ts` → `MF_SHARED`: `vue`, `vue-router`, `vue-i18n`, `@vueuse/core`,
`@apollo/client`, `@vue/apollo-composable`, `graphql`, and `@vc-frontend/core` itself.

---

## The load sequence (what actually happens at boot)

```
app-runner.ts
  │  const ready = startFederatedModules();   // fire early, don't await yet
  │  … other boot work …
  │  await ready;                             // BEFORE app.use(router)
  ▼
startFederatedModules()            bootstrap.ts
  │  if (!APP_MF_HOST) return;              ← flag off ⇒ instant no-op
  │  dynamic import("./index")              ← keeps MF runtime out of non-MF builds
  ▼
initFederatedModules()             index.ts
  1. resolveRemotes()              parse APP_MF_REMOTES → [{name, entry}]  (empty ⇒ done)
  2. isCompatible(remote)          fetch manifest JSON, compare requiredHostVersion
                                   with CORE_VERSION. Incompatible OR unreadable ⇒ SKIP
                                   (fail closed — no plugin code has run yet)
  3. registerRemotes(compatible)   { force: true } so HMR re-registration won't throw
  4. loadRemote(`${name}/plugin`)  ⇒ plugin module ⇒ await plugin.init()
  5. Promise.allSettled            one bad plugin cannot abort the others
  6. reportOutcome({loaded,failed,skipped})   logs; in DEV also shows a notification
```

Two design points worth calling out:

- **Awaited before `app.use(router)`** so a plugin that calls `router.addRoute()` in
  `init()` is registered *before* the initial navigation resolves — deep links to
  plugin routes work on first paint.
- **Version gate runs before any remote code executes.** We fetch the manifest (plain
  JSON, no execution), read `metaData.requiredHostVersion`, and only `loadRemote` the
  ones this host can satisfy. Unreadable manifest ⇒ treated as incompatible (fail closed).

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

2. **Depend on `@vc-frontend/core` for anything host-provided**, and mark it (plus the
   shared framework libs) as **shared/singleton** in its own MF config so it consumes the
   host's instance rather than bundling its own.

3. **Declare the host version it needs** in its manifest:

   ```jsonc
   // mf-manifest.json (excerpt)
   { "metaData": { "requiredHostVersion": "2.53.0" } }
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

Once built and deployed, add it to the host's `APP_MF_REMOTES` and it loads on next boot.

---

## Files in this folder

| File | Role |
|---|---|
| `bootstrap.ts` | App-runner entry. Flag check + dynamic import of the loader. **No static MF-runtime import** — so non-MF builds bundle neither the runtime nor the loader. |
| `index.ts` | The loader: resolve remotes → version gate → `registerRemotes` → `loadRemote`/`init` → report. Contains the `IFederatedPlugin` contract. |
| `compare-versions.ts` | Dotted-numeric version compare for the gate. Local so the harness touches zero core utilities. |

**Related files outside this folder:**

| File | Role |
|---|---|
| `vite.federation.ts` (repo root) | Build-side host config: `MF_SHARED` singletons, `federatedHostPlugin`, `federatedAlias`. At root because it imports a build-time dev dep. |
| `client-app/core-api/` | The `@vc-frontend/core` facade + the `build-types.mjs` type-contract build. |
| `client-app/app-runner.ts` | Calls `startFederatedModules()` and awaits it before `app.use(router)`. |

---

## Environment variables

| Var | Scope | Meaning |
|---|---|---|
| `APP_MF_HOST` | build + runtime | Enables the MF host plugin in Vite **and** the runtime bootstrap. Off ⇒ complete no-op. |
| `APP_MF_REMOTES` | runtime | JSON `{ "<name>": "<manifestUrl>" }`. Absent/invalid ⇒ no remotes loaded. |

---

## Gotchas & guarantees

- **Off by default.** No flag, no cost — the loader isn't even imported.
- **Isolation is total.** `initFederatedModules()` never rejects; a failing plugin is
  logged and reported, others still load.
- **Fail closed on version.** Can't read/parse a manifest ⇒ skip that remote.
- **The `.d.ts` is generated.** After any facade change, run `yarn build:core-types` and
  commit `client-app/core-api/dist/index.d.ts`. It must contain **zero** `@/` references
  (the build fails loudly otherwise).
- **Bump `CORE_VERSION`** (`core-api/version.ts`, kept in sync with `core-api/package.json`)
  on any breaking facade change.

See [`TODO.md`](./TODO.md) for what's intentionally deferred (remote discovery via a
central manifest, a CI guard for the generated contract, etc.).
