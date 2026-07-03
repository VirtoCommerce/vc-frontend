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
`--with-i18n`, `--with-apollo`, `--with-vueuse`, `--no-router` override.

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

In `package.json`: link the facade from a host checkout (no npm publish exists —
this is "publish from source"), and install **everything your code imports** as dev
dependencies — Vue included:

```jsonc
{
  "dependencies": {
    "@vc-frontend/core": "portal:../vc-frontend/client-app/core-api",
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

The facade dependency brings you the type contract (`dist/index.d.ts`) and the
shared-dependency config (`@vc-frontend/core/federation`).

## Step 2 — wire the build

`vite.config.ts` — the three things that matter are the **expose**, the **shared
config**, and the **manifest metadata**:

```ts
import { federation } from "@module-federation/vite";
import { createRemoteShared } from "@vc-frontend/core/federation";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "my-plugin",
      filename: "remoteEntry.js",

      // 1) The host loads exactly this: `loadRemote("my-plugin/plugin")`.
      exposes: { "./plugin": "./src/index.ts" },

      // 2) Never bundle your own Vue/Apollo/facade - borrow the host's.
      //    Defaults are overridable per package if you need to (see README).
      shared: createRemoteShared(),

      // 3) Tell the host which facade version you were built against.
      //    The host's CONTRACT GATE reads this from the manifest and refuses
      //    to run your code on an incompatible host (version or semver range).
      manifest: {
        additionalData: (data) => {
          (data.stats.metaData as Record<string, unknown>).requiredHostVersion = "^1.0.0";
          return data.stats;
        },
      },

      dts: false, // types come from the committed contract, not MF codegen
    }),
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

const route: RouteRecordRaw = { path: "/my-page", name: "MyPage", component: MyPage };

export function init(): void {
  globals.router.addRoute(route);
}
```

Rules of the road:

- **No `@/...` imports** — host source paths don't exist in your build. If you need
  something the facade doesn't export, that's a facade extension request (below).
- `init()` runs **before the host installs the router**, so routes you add here work
  even on a direct deep link.
- Keep `init()` fast: it has a time budget (10s), and the whole app boot waits for it.
- **Styling:** your components ship their own CSS (plain styles in SFCs work as-is).
  The host's Tailwind utilities are generated from HOST templates only — if you want
  Tailwind in the plugin, run your own Tailwind pass with your own config.

## Step 4 — run it against the host

```bash
# terminal 1 - your plugin (serves mf-manifest.json + chunks)
cd my-plugin && yarn build && yarn preview          # -> http://localhost:3001

# terminal 2 - the host, pointed at your plugin
cd vc-frontend
APP_MF_HOST=true \
APP_MF_REMOTES='{"my-plugin":"http://localhost:3001/mf-manifest.json"}' \
yarn build-only && yarn preview
```

Open the storefront, navigate to `/my-page` — your separately-built page renders
inside the live app. If something's off, the console tells you which gate said no
(`[MF] Skipping ...` / `[MF] Failed to load ...`), and the boot outcome is logged as
`{ loaded, failed, skipped }`.

`APP_MF_REMOTES` is a **map — any number of plugins**, each key being the remote's MF
`name` and each value its manifest URL (different origins are fine). All plugins are
gate-checked and loaded in parallel, each in isolation:

```bash
APP_MF_REMOTES='{"my-plugin":"https://a.example.com/my-plugin/mf-manifest.json","loyalty":"https://b.example.com/loyalty/mf-manifest.json"}'
```

> http is allowed for localhost only. Anywhere else: https, plus CSP entries for each
> plugin origin — see the **Security model** section of the README before shipping.

## Step 5 — ship it

1. Build and upload `dist/` (manifest + chunks) to trusted **https** hosting.
2. Add the manifest URL to the host's `APP_MF_REMOTES` and rebuild the host
   (the remote list is inlined at build time — backend-driven discovery is a
   planned follow-up, `TODO.md` #1).
3. Add the plugin origin to the storefront CSP (`script-src`, `connect-src`).

---

## Extending an extension point

Extension points let a plugin inject content into host screens **without owning
them** (widgets on account pages, etc.). From a plugin it's one facade import:

```ts
import { useExtensionRegistry } from "@vc-frontend/core";

useExtensionRegistry().register(/* category, name, your component */);
```

How the ExtensionPoint system works, the available categories, and payload shapes:
[`client-app/shared/common/composables/extensionRegistry/README.md`](../../shared/common/composables/extensionRegistry/README.md).

## Extending the facade

Plugin needs something the facade doesn't export yet? That's a **host-side** change,
and it's three small steps: add one re-export line to `core-api/index.ts`, run
`yarn build:core-types` (regenerates the contract and auto-bumps the version), commit.
The full flow, including what counts as a breaking change:
[`client-app/core-api/README.md`](../../core-api/README.md).

## Versioning cheat sheet

| You do…                                             | What happens                                                                            |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| add a facade export                                 | `yarn build:core-types` auto-bumps the contract **minor** (e.g. 1.0.0 → 1.1.0)          |
| remove/rename a facade export                       | the build refuses; you run `yarn bump:core major` explicitly — this breaks every plugin |
| build a plugin using a new export                   | declare `requiredHostVersion: "^1.1.0"` — older hosts will refuse it (CONTRACT GATE)    |
| build a plugin against a different Vue/Apollo major | the SHARED-DEPENDENCY GATE fails that plugin at load, in isolation                      |
| forget any of the regenerate/bump steps             | CI fails with the exact command to run                                                  |
