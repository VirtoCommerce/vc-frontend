# news-plugin — Module Federation MVP (VCST-5159)

A local, **no-publish** proof that the storefront `news` module can be delivered as
an independently-built **Module Federation 2.0 remote** that consumes the host's
running Vue / router / i18n / Apollo / UI-kit through a curated facade
(`@vc-frontend/core`), instead of being statically compiled into the app.

This is the source of `client-app/modules/news`, moved out and rewired so its only
host imports go through `@vc-frontend/core`. The plugin exposes a **no-arg `init()`**
lifecycle hook — it binds to the host's live `router`/`i18n` (and everything else)
through the shared facade (`globals.router` / `globals.i18n`) rather than receiving
them, so the host↔plugin contract is just `init()`.

## Build

```bash
# from the repo root (uses the root toolchain — no separate install)
yarn build:news-plugin      # emits examples/news-plugin/dist/{remoteEntry.js,mf-manifest.json}
yarn dev:news-plugin        # standalone dev server on :3001 (HMR), manifest at /mf-manifest.json
```

## Run end-to-end (host consumes the remote)

Host consumption is gated behind `APP_MF_HOST`; the host then loads `news` via
`loadRemote('news/plugin').init()` instead of the static in-app module.

```bash
# terminal 1 — serve the remote on https :3001 (mkcert; https avoids mixed-content blocking)
yarn dev:news-plugin

# terminal 2 — build + preview the host in MF mode (uses your .env.local APP_BACKEND_URL)
APP_MF_HOST=true yarn build-only && yarn preview
```

> Use **build + preview**, not `yarn dev`: the host dev server can't run in MF mode yet
> (see limitations — the MF plugin's esbuild pre-bundle of the shared facade can't load
> `.graphql`). The production rollup build has no such issue.

Remote discovery defaults to `{ news: "https://localhost:3001/mf-manifest.json" }`; override
with `APP_MF_REMOTES` (JSON map of `remoteName → manifestUrl`). Loader:
`client-app/modules/federated/index.ts`.

**Verified live against `vcst-qa.govirto.com`:** host fetches `:3001/mf-manifest.json` +
`remoteEntry.js`, the remote binds shared `@vc-frontend/core` from the host, the plugin's
`init()` registers all 4 news routes, and `/news` renders real articles through the shared
Apollo client + host ui-kit — see the deep-link caveat below.

## How it fits together

| Concern | Mechanism |
|---|---|
| Public host surface | `client-app/core-api` → package `@vc-frontend/core` (a facade; nothing moves) |
| Local dev, no publish | `@vc-frontend/core` linked via Yarn `portal:./client-app/core-api` |
| Shared singletons | `vue`, `vue-router`, `vue-i18n`, `@vueuse/core`, `@apollo/client`, `@vue/apollo-composable`, `graphql`, `@vc-frontend/core` — `singleton:true`, `requiredVersion:"*"`, `import:false` (plugin never bundles a copy) |
| Exposed contract | `./plugin` → `src/index.ts` exporting `init()` (binds to host router/i18n via the facade) |
| Locales | `src/load-locale.ts` — plugin-local glob (the host's `loadModuleLocale` globs the host's own `modules/` dir and can't serve a remote) |

## What this MVP proves

- ✅ The remote builds and emits `mf-manifest.json` with `./plugin` + all 8 shared singletons.
- ✅ Shared code (ui-kit, `reka-ui`, Vue, …) is **not** bundled into the plugin — it binds to the host at runtime.
- ✅ `@vueuse/core` shared as a singleton keeps `createGlobalState` composables (useUser/useCart/useExtensionRegistry) shared with the host.
- ✅ The plugin type-checks against a **self-contained compiled contract** (`@vc-frontend/core`'s
  `dist/index.d.ts`) — hermetically, touching **zero host source** (#3, see below).
- ✅ `requiredVersion:"*"` decouples runtime from the facade version → a host bump never forces a plugin re-release.
- ✅ **The in-app `client-app/modules/news` module is deleted** — news is delivered *only* by this
  plugin. Both seams are federated: the list/routes via `init()`, and the SEO article page via a
  second expose `./news-article-page` that the host's slug matcher `loadRemote()`s. Verified: host
  build + typecheck pass with the module gone, and `loadRemote('news/news-article-page')` resolves
  to the `news-article` component at runtime.

## Styling: plugins need the shared Tailwind preset

The plugin's components style themselves with `@apply` + Tailwind utilities (BEM classes
like `news-articles__title`). Those utilities are generated per-build, and the host's
Tailwind only scans `client-app/**` — so the plugin needs **its own Tailwind pass**:

- `postcss.config.cjs` — same pipeline as the host, Tailwind pinned to the plugin config.
- `tailwind.config.cjs` — spreads the **host config** (design tokens/theme) but scans only
  the plugin's `src/**` (an external plugin would import the preset from `@vc-frontend/core`).
- `src/styles.css` — `@tailwind components; @tailwind utilities;` (no `base`, to avoid
  re-injecting the host preflight), imported by the plugin entry.

With this, the federated `/news` renders **pixel-identical to production**
(`vcst-qa-storefront.govirto.com/news`).

## Robustness (implemented)

- **Version safety (#2).** The loader reads each remote's manifest (`metaData.requiredHostVersion`,
  a plain JSON fetch — no code execution) and compares it to the host's `CORE_VERSION` before
  loading. Incompatible → **skipped**, never executed. Verified live: `requiredHostVersion:"2.0.0"`
  (≤ host `2.53.0`) loads; `"99.0.0"` is skipped and `/news` 404s. Uses the existing
  `compareVersions` from `checkModulesVersions`.
- **Deep-link timing (#4).** Plugin routes are added via async import, so `app-runner` now
  **awaits `initNewsModule` before `app.use(router)`** — routes exist before the router's initial
  navigation. Hard loads / deep links to `/news` render (verified), with no 404 flash and no
  post-hoc `router.replace` (which could hijack a later navigation).
- **Observable failures (#8).** `initFederatedModules` returns `{ loaded, failed, skipped }`;
  each failure/skip is logged with context, summarized, and surfaced as a dev notification.
  (Prod should route these to AppInsights `trackException`.)
- **Minimal singleton set (#6).** `MF_SHARED` is documented entry-by-entry with the reason each
  package *must* be a single instance; anything not requiring it is intentionally excluded so
  plugins can version it independently.
- **Compiled type contract (#3).** `@vc-frontend/core` now ships a **single, self-contained
  `dist/index.d.ts`** built by `yarn build:core-types` (vue-tsc emit → `rollup-plugin-dts`
  rollup; the facade's whole `@/…` graph is inlined, leaving only shared-peer imports like
  `vue`/`@apollo/client`). The plugin's `tsconfig` dropped its `@/*` + source-path hacks and
  resolves the facade like any installed package (`package.json` `exports.types`). Result,
  verified: the plugin typecheck went from **338 errors across ~140 host files → 0 errors,
  0 host files** — a genuine, publishable contract, exactly what an external repo would consume.
  The runtime is unchanged (host still provides the live instance via the MF singleton), so this
  is types-only: no second implementation, no drift between the contract and what runs.

## Known limitations / next steps

- **Contract drift guard.** `dist/index.d.ts` is generated and committed so plugins type-check
  with no prebuild. Nothing yet *forces* regeneration when the facade surface changes — a CI step
  that re-runs `yarn build:core-types` and fails on a non-empty `git diff` is the intended guard
  (follow-up). The build itself is drift-proof (regenerated from source); only the commit can lag.
- **Dev server (`yarn dev`) blocked in MF mode.** `@module-federation/vite` pre-bundles the
  shared `@vc-frontend/core` facade with esbuild, which has no `.graphql` loader (77/199 query
  files use `#import`), so the host dev server fails. Use `build-only` + `preview` for now;
  a real fix is an esbuild GraphQL plugin for the MF prebundle, or shipping the facade as
  compiled JS/`.d.ts` so its source graph isn't crawled.
- **https both sides.** The host runs on https (mkcert); the remote must too, or the browser
  blocks the cross-origin remote as mixed content. Both use the shared `.certificates` CA.
- **Remote discovery.** For the MVP the remote URL is env/convention (`APP_MF_REMOTES` or a
  localhost default); production should add an `entryUrl` to the `InitializeApplication`
  module manifest and feed the loader from there.
- **News is now MF-only.** With `client-app/modules/news` deleted and the fallback branch
  removed, a build with `APP_MF_HOST` off has **no news at all** (the slug matcher throws for
  news-article URLs, degrading to no render). That's the intended trade-off of full removal; a
  production rollout would either always enable MF or provide a graceful "news unavailable" state.
