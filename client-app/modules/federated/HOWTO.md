# How to build a federated plugin — a walkthrough

This is the **tutorial** counterpart to the reference docs. Read this top-to-bottom
once, and you know the whole developer workflow. For the "how it works" depth, see
[`README.md`](./README.md) (loader, gates, security) and
[`../../core-api/README.md`](../../core-api/README.md) (the facade and its type
contract).

What you'll build: a plugin that lives in **its own project**, is **built and
deployed on its own**, and gets loaded by the storefront over HTTP at startup —
adding its routes and pages as if it were compiled in.

---

## The 30-second mental model

Your plugin imports host services (router, Apollo, components…) from **one package**:
`@vc-frontend/core`. At compile time that package gives you **types only** (one
committed `.d.ts` file). At runtime the storefront hands your code its **live
objects** through Module Federation. You never **bundle** Vue, Apollo, or the host —
you borrow the running ones. (You still install them locally as compile-time tools —
step 1 explains.)

---

## Step 1 — scaffold the project

**Fast path — generate it.** From a host checkout:

```bash
yarn create:plugin my-plugin ../my-plugin
```

The generator reads all dependency versions **from the host's package.json** (so your
compile-time tools always match the host's runtime), asks which optional groups you
need (vue-router / vue-i18n / Apollo / @vueuse — unselected ones are also dropped from
the MF shared config), and emits everything described below, ready for
`yarn install && yarn build`. Non-interactive: `--yes` takes the defaults;
`--with-i18n`, `--with-apollo`, `--with-vueuse`, `--with-tailwind`, `--no-router` override.

**What it generates (the manual version):** a plugin is an ordinary Vite + Vue project,
separate from the host repo:

```
my-plugin/
├── src/
│   ├── index.ts          # the plugin entry: exports init()
│   └── pages/MyPage.vue
├── vite.config.ts
└── package.json
```

In `package.json`: pin the facade to its **versioned tarball URL** — a Release asset
of the (public) host repo, published by the _Core Facade Release_ workflow. No
registry, token, or account; any package manager installs it, and your lockfile
records the tarball checksum so the pin is tamper-evident. Then install **everything
your code imports** as dev dependencies — Vue included:

```jsonc
{
  "dependencies": {
    "@vc-frontend/core": "https://github.com/VirtoCommerce/vc-frontend/releases/download/core-v0.1.0/vc-frontend-core-0.1.0.tgz",
  },
  "devDependencies": {
    // compile-time only - NOTHING below ships in your bundle (import: false);
    // pick versions inside the host's shared ranges (federation.mjs),
    // ideally the host's exact versions
    "vue": "3.5.39",
    "vue-router": "^4.6.4",
    "@module-federation/vite": "1.16.12",
    "@vitejs/plugin-vue": "^6.0.0",
    "typescript": "~5.9.0",
    "vite": "^7.0.0",
  },
}
```

Why install Vue if you "borrow the host's"? Borrowing happens at **runtime** only. At
build time your local Vue is like C header files: `@vitejs/plugin-vue` needs its
compiler for your SFC templates, TypeScript needs its types, Vite needs to resolve the
imports. `createRemoteShared()` then guarantees none of it lands in the bundle — the
built chunks reference the host's live instances. (Add `vue-i18n`, `@apollo/client`,
`@vue/apollo-composable`, `@vueuse/core` the same way if you import them.)

> **Type-peers — install them even if your code never imports them.** The facade's
> `contract/index.d.ts` _references_ external libraries in its own types (e.g. `useModuleSettings`
> pulls in `@vueuse/core`, `apolloClient` pulls in `@apollo/client`). If a referenced
> package isn't installed, TypeScript **silently degrades that whole facade export to
> `any`** — the plugin tsconfig ships `skipLibCheck: true`, so you get no "Cannot find
> module" error, just lost intellisense (an IDE hover shows `any`). These are exactly the
> **MF shared singletons** (`federation.mjs`), so **`yarn create:plugin` installs the whole
> set for you automatically** — regardless of which optional groups you pick. Only
> hand-written `package.json`s need to copy them in; the generator is the recommended path
> precisely so you never have to.

The facade dependency brings you the type contract (`contract/index.d.ts`) and the
shared-dependency config (`@vc-frontend/core/federation`).

### Mount helpers for your specs

`@vc-frontend/core/testing` ships the host's `createWrapperFactory` /
`createShallowWrapperFactory` as real source — the root export is types-only because the host
injects the implementation at runtime, and your specs run with no host to inject anything.
Pass `mount` in rather than letting the helper import it, so it uses your copy:

```ts
import { createWrapperFactory } from "@vc-frontend/core/testing";
import { mount } from "@vue/test-utils";

const createWrapper = createWrapperFactory(mount, MyComponent);
```

It needs `vue-i18n` (already a shared singleton) and `lodash-es` as dev dependencies. Neither
reaches your bundle: this module is only ever imported by specs.

### Everything else is just your dependency

A package that is **not** in `MF_SHARED_RANGES` needs no ceremony: `yarn add` it and it
gets bundled into your plugin, even when the host happens to use it too. A second copy is
only a bundle-size cost, not a correctness one — that is exactly the criterion the shared
list is built on (`federation.mjs`). The sales-rep hub's `sortablejs` (drag-and-drop
layout) is the worked example: leaf DOM library, no cross-copy state, so it stays out of
the shared list and rides along in the plugin bundle.

> **The exception to watch: libraries whose state crosses the host/plugin boundary
> through `provide`/`inject`.** `vee-validate` is the live case — sales-rep gets away with
> its own copy only because its modal owns _both_ the `useForm` and the `useField` inside
> it. A plugin that instead contributes a **field into a host-owned form** would inject
> from the host's copy and find nothing; that library would have to move into
> `MF_SHARED_RANGES` (and its range verified against the host's `package.json`) first.

## Step 2 — wire the build

`vite.config.ts` — the three things that matter are the **expose**, the **shared
config**, and the **manifest metadata**:

```ts
import { federation } from "@module-federation/vite";
import { createRemoteFederationOptions } from "@vc-frontend/core/federation";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue(),
    // One call - the HOST owns the wiring conventions (expose key `./plugin`,
    // shared singletons with import:false, manifest metadata, dts off), so plugins
    // pick up convention changes by updating their host checkout, not their config.
    federation(
      createRemoteFederationOptions({
        name: "my-plugin",
        // CONTRACT GATE: the facade version this plugin is built against.
        requiredHostVersion: "^0.1.0",
        // Optional: sharedOverrides / exposes when you need to deviate.
      }),
    ),
  ],
  build: { target: "esnext" }, // MF entry uses top-level await
  server: { port: 3001, cors: true, origin: "http://localhost:3001" },
});
```

## Step 3 — write the plugin code

`src/index.ts` exports a **no-argument `init()`**. You don't receive the router or
i18n — you reach them through the facade's `globals`, because at runtime those ARE
the host's live instances:

```ts
import { globals, useModuleSettings } from "@vc-frontend/core";
import type { RouteRecordRaw } from "vue-router";

const MyPage = () => import("./pages/MyPage.vue");

const route: RouteRecordRaw = { path: "/my-plugin", name: "my-plugin", component: MyPage };

export function init(): void {
  globals.router.addRoute(route);
}
```

Rules of the road:

- **No `@/...` imports** — host source paths don't exist in your build. If you need
  something the facade doesn't export, that's a facade extension request (below).
- `init()` runs **before the host installs the router**, so routes you add here work
  even on a direct deep link.
- Keep `init()` fast: it has a time budget (5s — the loader's per-phase `loadTimeoutMs`),
  and the whole app boot waits for it.
- **Styling:** your components ship their own CSS (plain styles in SFCs work as-is).
  For **Tailwind**, scaffold with `--with-tailwind` (or copy its output): the plugin
  runs its own utility pass with the **host's design system as preset**
  (`require("@vc-frontend/core/tailwind-preset")` in `tailwind.config.cjs` — colors
  resolve through the host's CSS variables at runtime), scans only the plugin's own
  sources, and emits `components` + `utilities` **without `base`** so the host's
  preflight isn't re-applied.

## Step 4 — run it against the host

```bash
# terminal 1 - your plugin (serves mf-manifest.json + chunks)
cd my-plugin && yarn build && yarn preview          # -> http://localhost:3001

# terminal 2 - the host, pointed at your plugin
cd vc-frontend
APP_MODULES_FEDERATION_ENABLED=true \
APP_MODULES_FEDERATION_REMOTES='{"my-plugin":"http://localhost:3001/mf-manifest.json"}' \
yarn build-only --mode=development && yarn preview  # -> https://localhost:3000
```

Notes on the host side:

- **build + preview is the canonical run** — it matches what CI/prod produce, so it is the
  default for _running_ the host. (`yarn dev` also works and additionally gives HMR — see
  [**The dev inner loop**](#the-dev-inner-loop) below — reach for it as the iteration loop.)
  `yarn preview` proxies API calls to `APP_BACKEND_URL` exactly like dev does, so your usual
  `.env.local` backend applies.
- **`--mode=development` matters locally**: a production-mode build resolves the store
  from the browser's hostname — `localhost` means nothing to the backend, and the app
  renders an empty page. A development-mode build resolves the store from
  `APP_BACKEND_URL`, exactly like `yarn dev`.
- The preview server is **https** (same local certificate as the dev server).
- The remote list is inlined at **build** time — changing `APP_MODULES_FEDERATION_REMOTES` means
  rebuilding the host.

Open `https://localhost:3000/my-plugin` — your separately-built page renders inside the
live storefront. In a development-mode build the console confirms the load with
`[MF] plugins loaded=[my-plugin]` (the positive signal you want when a plugin registers
an extension point and renders no route of its own). If something's off, the console
tells you which gate said no instead — `[MF] Skipping ...` (CONTRACT GATE) or
`[MF] Failed to load ...` (SHARED-DEPENDENCY GATE) — followed by the outcome summary
`[MF] plugins loaded=… failed=[…] skipped=[…]`.

`APP_MODULES_FEDERATION_REMOTES` is a **map — any number of plugins**, each key being the remote's MF
`name` and each value its manifest URL (different origins are fine). All plugins are
gate-checked and loaded in parallel, each in isolation:

```bash
APP_MODULES_FEDERATION_REMOTES='{"my-plugin":"https://a.example.com/my-plugin/mf-manifest.json","loyalty":"https://b.example.com/loyalty/mf-manifest.json"}'
```

> http is allowed for localhost only. Anywhere else: https, plus CSP entries for each
> plugin origin — see the **Security model** section of the README before shipping.

### The dev inner loop

Once the two servers are up, how you iterate depends on which side you're changing.

**Changing plugin code — two loops, pick one** (the scaffold ships a script for each):

- **Rebuild + reload (always works):** `yarn watch` in the plugin (`vite build --watch`,
  rebuilds `dist/` on save in ~0.5s) while `yarn preview` keeps serving it; then reload the
  browser. No host rebuild, no `preview` restart — the host re-fetches the manifest + the
  content-hashed chunks on reload. Do a cache-bypassing reload (DevTools "Disable cache")
  so a stale `mf-manifest.json` isn't served.
- **HMR (no reload):** run the plugin as its own dev server — `yarn dev` (`vite --port
3001`, which serves `mf-manifest.json` in dev too) instead of `build`+`preview` — **and**
  run the host with `yarn dev` instead of `build-only`+`preview`. The plugin's HMR client is
  injected into the host page, so edits hot-update live across the MF boundary. Verified on
  this harness for route / UI-kit / `useModuleSettings` plugins **and** for a plugin that
  shares `@apollo/client`+`graphql` and runs its own query through the shared Apollo client
  (an older note warned the dev server couldn't prebundle the shared GraphQL facade — that no
  longer reproduces). `build`+`preview` is still the canonical run because it matches
  CI/prod; use `yarn dev` when you want the HMR loop.

**Changing the host** — you only rebuild the host when the **remote list/name** changes
(`APP_MODULES_FEDERATION_REMOTES` is inlined at build time) or host source changes; plain plugin edits
never need a host rebuild.

## Step 5 — ship it

1. Build and upload `dist/` (manifest + chunks) to trusted **https** hosting.
2. Add the manifest URL to the host's `APP_MODULES_FEDERATION_REMOTES` and rebuild the host
   (the remote list is inlined at build time — settings-driven runtime discovery
   is a planned follow-up, `TODO.md` #2).
3. Add the plugin origin to the storefront CSP (`script-src`, `connect-src`).

### The other route: shipping inside a Virto Commerce module

The platform released a second way for a storefront plugin to reach a browser, on
2026-08-03 — `vc-module-x-api` **3.1016.0** and `vc-module-x-frontend` **3.1005.0**. Instead
of its own hosting, the plugin rides in a backend module's artifacts and the platform both
serves and announces it:

- the module declares a dependency on x-frontend, and its build writes the bundle to
  `{MODULE_FOLDER}/plugins/vc-frontend/`;
- the environment yml routes `- path: /modules  route: platform`;
- the storefront asks for the list rather than being told at build time:

```graphql
query InitializeApplication($domain: String!) {
  store(domain: $domain) {
    storeUrl
    plugins(appId: "vc-frontend") {
      id
      version
      permission
      entry {
        type
        path
      }
      remote {
        name
        exposed
      }
      contentFiles {
        hash
        path
      }
    }
  }
}
```

Same origin as the storefront, so no per-plugin CSP entry and no external hosting to buy.

**This host does not consume that yet**, and two things have to move first:

1. The loader reads `APP_MODULES_FEDERATION_REMOTES` — the build-time env described above —
   not `plugins(appId:)`. That is `TODO.md` #2.
2. The loader **requires a manifest JSON URL** and skips anything else (see the "entry must
   be a manifest JSON URL" guard in `index.ts`), while the platform advertises
   `.../remoteEntry.js`. Either the loader learns to take a remoteEntry, or the platform's
   entry path points at `mf-manifest.json`.

For the packaging half there is a working reference:
`vc-module-system-operations/samples/VirtoCommerce.SystemOperations.SampleExtension` —
`@module-federation/vite`, remote `name` set to the .NET module id, `outDir` writing straight
into the discovery folder, and `remoteEntry.js` deliberately left unhashed because the
platform synthesizes that exact path. Read it for the build config only: that sample is a
plugin for the **System Operations admin app**, so its `./Module` expose and
`install(host, ctx)` shape are that app's contract — this host's are `./plugin` and `init()`,
as in Steps 2 and 3.

---

## Extending an extension point

Extension points let a plugin inject content into host screens **without owning
them** (widgets on account pages, etc.). From a plugin it's one facade import:

```ts
import { EXTENSION_NAMES, useExtensionRegistry } from "@vc-frontend/core";

useExtensionRegistry().register("sharedList", EXTENSION_NAMES.sharedList.provenanceNote, {
  component: YourComponent,
});
```

Take the name from `EXTENSION_NAMES`, not a literal — the host matches registrations against
those keys.

How the ExtensionPoint system works, the available categories, and payload shapes:
[`client-app/shared/common/composables/extensionRegistry/README.md`](../../shared/common/composables/extensionRegistry/README.md).

## Extending the facade

Plugin needs something the facade doesn't export yet? That's a **host-side** change,
and it's three small steps: add one re-export line to `core-api/index.ts`, run
`yarn build:core-types` (regenerates the contract and auto-bumps the version), commit.
The full flow, including what counts as a breaking change:
[`client-app/core-api/README.md`](../../core-api/README.md).

### Co-developing the facade and a plugin (yalc)

While that facade change is still **unpushed and unreleased**, your plugin can't get it
from the pinned tarball. Bridge the gap with [yalc](https://github.com/wclr/yalc)
(`npm i -g yalc`) — a local, offline package store; no registry, token, or account. It
copies real files into the consumer (no symlinks), so Vite/TS resolve it like a normal
install:

```bash
# once: publish the local facade and link it into the plugin.
# --private is required: the facade package is `"private": true`, and yalc (like npm)
# refuses to publish a private package without it. `yarn core:yalc-push` already passes it.
cd vc-frontend/client-app/core-api && yalc publish --private
cd my-plugin && yalc add @vc-frontend/core && yarn install

# every facade edit: rebuild the contract + push to all linked plugins (one command)
cd vc-frontend && yarn core:yalc-push
```

**Hygiene:** yalc rewrites your plugin's `@vc-frontend/core` to a `file:.yalc/...` path.
`.yalc/` and `yalc.lock` are gitignored by the scaffold, but the `package.json` edit is
not — before pushing, run `yalc remove @vc-frontend/core` and restore the pinned tarball
URL. Never commit a `file:` facade dependency. Once the facade change is merged and the
_Core Facade Release_ workflow has published `core-v<new-version>`, bump your pin to the
new URL (and your `requiredHostVersion` if you use the new exports).

## Versioning cheat sheet

| You do…                                             | What happens                                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| add a facade export                                 | `yarn build:core-types` auto-bumps the contract **patch** (e.g. 0.1.0 → 0.1.1)          |
| remove/rename a facade export                       | the build refuses; you run `yarn bump:core minor` explicitly — this breaks every plugin |
| build a plugin using a new export                   | declare `requiredHostVersion` = the version that ADDED the export (`^0.1.1`, not the line floor `^0.1.0`) — older hosts then refuse it (CONTRACT GATE) |
| build a plugin against a different Vue/Apollo major | the SHARED-DEPENDENCY GATE fails that plugin at load, in isolation                      |
| consume a new facade version in your plugin         | bump the pinned tarball URL to `core-v<new>` **and** `requiredHostVersion` together     |
| forget any of the regenerate/bump steps             | Caught by `yarn validate:core-types` — run it by hand; during the MF pilot it is not in CI |
