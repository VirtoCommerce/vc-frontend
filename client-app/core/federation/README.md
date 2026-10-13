# Module Federation in the storefront

**For:** anyone who touches the storefront host, or needs to know how plugins get into it.
**Want to do something specific?** Start at the [scenarios](./scenarios/README.md) instead.

> **TL;DR**
>
> - A **plugin** is a bundle built and deployed apart from the storefront. The storefront loads it at startup.
> - It is **off by default**. Turn it on with `module_federation_enabled: true` in the theme settings, then rebuild.
> - Plugins usually ship **inside a backend module**. Installing the module installs the plugin; the storefront is
>   not rebuilt.
> - A plugin talks to the host only through **`@vc-frontend/core`** (the _facade_).

**How to read the claims below:** everything is implemented on `dev` unless it is marked **Planned** or **Not
verified**. Each section ends with the code and tests that hold it.
_Source-checked against `dev` @ `8c788b038`, facade 0.2.3, on 2026-10-13._

---

## 1. What a plugin is

```
  Storefront (host)                          Plugin (its own project, its own release)
 ┌───────────────────────────┐   at startup  ┌───────────────────────────┐
 │ Vue, router, Apollo,      │ ◀──── HTTP ── │ init()  ← called by host  │
 │ UI kit, user, settings    │               │ pages, menu items,        │
 │                           │ ── facade ──▶ │ widgets                   │
 │ hands over LIVE objects   │               │ borrows them, bundles     │
 └───────────────────────────┘               │ none of them              │
                                             └───────────────────────────┘
```

A plugin can:

1. add **pages** (routes),
2. add **menu items** (header, account menu),
3. fill **places in host pages** (the extension registry: product card, payment step, order page…),
4. use **host services**: the router, the Apollo client, the user, module settings, notifications, modals.

**Plugin or in-repo module?**

| Choose         | When                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------ |
| In-repo module | The feature ships with the storefront release. (`client-app/modules/*`, see `modules/README.md`) |
| Plugin         | The feature ships with a **backend module**, on that module's release cadence.                   |

## 2. Status

| Area                                              | State                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Loading, version gates, declared contributions    | Implemented                                                                             |
| Platform discovery (`store.plugins`)              | Implemented; needs the backend floors in `BACKEND_REQUIREMENTS`                         |
| Plugin inside a backend module (scaffold + check) | Implemented (`create:plugin --module`, `check:plugin-module`)                           |
| CSS isolation between plugin and host             | **Planned** (VCST-5760). Until then, see [section 10](#10-security-and-trust)           |
| Integrity check of plugin files                   | **Deferred on purpose** while plugins come from our own backend                         |
| Production logging of plugin failures             | **Planned**. Production logs nothing today; see [section 11](#11-when-it-does-not-work) |

Open work lives in [`TODO.md`](./TODO.md).

## 3. Turning it on

1. Set `"module_federation_enabled": true` in `client-app/config/settings_data.json`.
2. Rebuild the storefront.

> ⚠️ Only a literal `true` turns it on. A missing key, `"true"` or `1` all mean **off**.
>
> ⚠️ The switch is read **at build time**. Flipping it on a built storefront does nothing.

With the switch off, the build contains no federation code at all and sends no plugin request.

_Source:_ `switch.ts` (`isFederationSwitchOn`), `vite.federation.ts`, `enabled.ts`.
_Tests:_ `bootstrap.test.ts` "is a no-op with the theme config as shipped"; `boot-order.test.ts` "issues nothing
when the theme turns federation off".

## 4. How the storefront finds plugins

There are two sources, and **only one is used**:

```
        APP_MODULES_FEDERATION_REMOTES set at build time?
                         │
              yes ───────┴─────── no
               │                   │
   use ONLY that list        ask the platform:
   (local work, or a         store.plugins(appId: "vc-frontend")
   plugin hosted elsewhere)  = every installed module that ships
               │               plugins/vc-frontend/
               └──────┬────────────┘
                      ▼
       one mf-manifest.json URL per plugin
```

> ⚠️ The override **replaces** the platform list. `{}` or broken JSON still replaces it, so nothing loads.

| Source   | URL rules                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Override | JSON map `{ "<remote name>": "<…/mf-manifest.json>" }`; https, http only for localhost                                 |
| Platform | The entry must be on the storefront's own origin. The host swaps `remoteEntry.js` for the `mf-manifest.json` beside it |

Locally, the dev and preview servers proxy `/modules/*/plugins/vc-frontend/` to `APP_BACKEND_URL`. So a
plugin installed on a backend also works against a locally run storefront, with no override.

_Source:_ `index.ts` (`resolveRemotes`), `app-runner.ts` (`ASK_PLATFORM_FOR_PLUGINS`).
_Tests:_ `platform-discovery.test.ts` "lets the env override win over the platform list", "registers the
manifest that sits next to the platform's entry…"; `index.test.ts` "rejects non-https remote URLs…".

## 5. Declare, then implement

A plugin tells the host about itself in **two layers**:

| Layer         | File                      | When the host reads it            | What it is for                                     |
| ------------- | ------------------------- | --------------------------------- | -------------------------------------------------- |
| **Declare**   | `plugin.config.ts`        | before any plugin code is fetched | placeholders, menu entries, reserved space, `when` |
| **Implement** | `src/index.ts` → `init()` | after the plugin code loads       | the real routes, components and logic              |

The build turns `plugin.config.ts` into a `contributions` field in the built `plugin.json`. The platform serves
that field in `store.plugins`.

```ts
// plugin.config.ts: what the host knows up front
export default definePluginManifest({
  routes: [{ path: "documents", parent: "Company", name: "SalesRepDocuments" }],
});

// src/index.ts: the real thing
export function init(): void {
  globals.router.addRoute("Company", { path: "documents", name: "SalesRepDocuments", component: Page });
}
```

> ⚠️ **Register a declared route before the first `await` in `init()`.** A later call is refused, yet the plugin
> is still reported as loaded.

What a declaration buys:

1. **`when` false** on the plugin: nothing of it is fetched, not even the manifest.
2. **Routes:** a deep link shows a loader inside the parent's layout, then the page, instead of a 404.
3. **Menu entries** render before the plugin code arrives.
4. **Slots** (`reserve` / `block`) hold their space, so the page does not jump when the plugin lands.
5. **`blocksBoot: true`:** the first render waits for this plugin. Use it only when something must exist before the
   first paint.

Full syntax (conditions, slot contexts, examples): [`HOWTO.md` → Declaring contributions](./HOWTO.md#declaring-contributions).

_Source:_ `core-api/manifest.mjs` (`definePluginManifest`, `pluginContributions`), `contributions/declare.ts`.
_Tests:_ `declared-contributions.test.ts` "refuses a declared route its own plugin adds after an await in
init…", "fetches nothing of a plugin whose declared `when` is false…", "declares a plugin's routes before its
code loads and does not make boot wait for it".

## 6. What happens at startup

```
 1. Get the list ─────── platform query (or the override). Failing ⇒ no plugins, the app still starts.
 2. Prepare ──────────── no plugin code yet:
                         • permission check   (user lacks it ⇒ skipped, nothing fetched)
                         • plugin-level when  (false ⇒ skipped, nothing fetched)
                         • placeholders, menu entries, slots from the declarations
 3. Per plugin, in parallel:
      a. fetch mf-manifest.json ─▶ GATE 1: facade version   (no ⇒ skipped)
      b. load the code ────────── ▶ GATE 2: shared libraries (no ⇒ failed)
      c. call init()
 4. Settle ───────────── each plugin: loaded / failed / skipped. Unused placeholders are removed.
```

**What the first render waits for:**

1. Always: steps 1–2 (the list and the declarations).
2. Only for plugins with `blocksBoot: true`: their `init()`, capped by `BOOT_BACKSTOP_MS`.
3. Never for any other plugin's code. A declared route shows a loader until its plugin settles; past
   `PLACEHOLDER_SLOW_NOTICE_MS` the loader offers a reload.

**Limits to know:**

1. `BOOT_BACKSTOP_MS` starts **after** step 1, not at page load.
2. A timeout stops **waiting**. It does not cancel code that already runs, and an `init()` that started keeps
   going.
3. **"Loaded" does not mean "working".** A module without `init()` still counts as loaded, with a warning.
4. A plugin's errors never take down the storefront or other plugins.

Per-step budgets: `DEFAULT_MANIFEST_TIMEOUT_MS` and `DEFAULT_LOAD_TIMEOUT_MS` for `blocksBoot` plugins,
`DEFAULT_DEFERRED_TIMEOUT_MS` for the rest (`index.ts`).

_Source:_ `bootstrap.ts` (`startFederatedModules`), `index.ts` (`prepareFederatedModules`, `loadPreparedModules`).
_Tests:_ `bootstrap.test.ts` "waits for the plugin list like any other boot request, and only then starts the
backstop", "does not wait for the code of a plugin that did not ask for it"; `index.test.ts` "reports failed on
an overrunning init()…", "counts a plugin without init() as loaded", "isolates a failing plugin from the
others"; `index.test.ts` "backstop invariant…".

## 7. Compatibility: two gates

| Gate                     | Compares                                                        | When                              | On a mismatch                     |
| ------------------------ | --------------------------------------------------------------- | --------------------------------- | --------------------------------- |
| **1 · Facade version**   | the plugin's `requiredHostVersion` vs the host's `CORE_VERSION` | before any plugin code is fetched | **skipped**: none of its code ran |
| **2 · Shared libraries** | the plugin's ranges for Vue, Apollo… vs the host's versions     | while the code loads              | **failed**, that plugin only      |

1. Gate 1 fails closed: a missing, broken or unreadable requirement counts as "no".
2. A bare `"0.2.3"` means `^0.2.3`. On 0.x a new **minor** is breaking, so `^0.2.3` refuses `0.3.0`.
3. **Neither gate proves the plugin works.** They compare version numbers, not behaviour. `requiredHostVersion` is
   the plugin author's claim.

How the facade itself is versioned and released: [`core-api/README.md`](../../core-api/README.md).

_Source:_ `version-gate.ts` (`checkHostCompatibility`), `core-api/federation.mjs` (`strictVersion`).
_Tests:_ `version-gate.test.ts`; `index.test.ts` "skips an incompatible plugin before loading any of its code",
"skips (fail closed) a manifest that declares no requiredHostVersion"; `federation-shared.test.ts` "every shared
dep is a strict singleton with a real version range".

## 8. The facade and shared libraries

1. **Host APIs come only from `@vc-frontend/core`.** Never `@/…`: those paths do not exist in a plugin's build.
   Importing a library itself (`vue-router`, `@vue/apollo-composable`) is fine.
2. **At compile time** the facade gives **types only** (`core-api/contract/index.d.ts`).
   **At runtime** the host hands over its **live objects**: one Vue, one router, one Apollo cache.
3. The libraries that must exist once (Vue, vue-router, vue-i18n, VueUse, the Apollo client and composable,
   GraphQL, the facade) are listed in **one place**, `MF_SHARED_RANGES` in `core-api/federation.mjs`. A plugin borrows them and never bundles a copy.
4. Any other library a plugin uses is bundled into the plugin. That is fine unless the library shares state
   through `provide`/`inject` across the host/plugin line; then it must join the shared list first.

What is exported and how to add to it: [`core-api/README.md`](../../core-api/README.md).

_Tests:_ `federation-shared.test.ts` "host and remote configs cover exactly the same packages", "remote config
never bundles fallback copies".

## 9. Shipping a plugin

| Way                         | How it reaches the storefront                                     | Storefront rebuild? |
| --------------------------- | ----------------------------------------------------------------- | ------------------- |
| **Inside a backend module** | the module carries `plugins/vc-frontend/`; the platform serves it | No                  |
| Hosted elsewhere            | its manifest URL goes into `APP_MODULES_FEDERATION_REMOTES`       | Yes                 |

The backend-module path, step by step: [scenario S1a](./scenarios/s1a-plugin-in-an-existing-module.md).
What every environment needs (backend floors, the `/modules` route): [scenario S6](./scenarios/README.md).

`yarn check:plugin-module <module *.Web> [--artifact <zip>] [--env <storefront-url>]` checks the module, its
package and an environment.

_Source:_ `core-api/plugin-module.mjs`, `core-api/backend-requirements.mjs` (`BACKEND_REQUIREMENTS`).
_Tests:_ `plugin-module.test.ts`, `create-plugin.test.ts` "create-plugin --module".

## 10. Security and trust

A plugin runs with the **storefront's full rights**: same origin, same session, same Apollo client. Installing a
module that ships a plugin means letting its code into every visitor's browser.

What the host enforces:

1. **Fail closed.** A manifest that cannot be fetched, read or version-matched never runs.
2. **Same origin** for platform plugins. Only the build-time override can load code from another origin, over
   https (http only for localhost).
3. **No route takeover.** While plugins load, a plugin cannot replace or remove a host route by name.
4. **Safe remote names**, so one plugin cannot capture another's code request.

What the host does **not** do:

1. **Permissions are not a security boundary.** A plugin's `permission` only decides whether a browser loads it.
   Its files are public by URL. **The backend must authorize every query.**
2. **The manifest's contents are not checked.** A same-origin manifest may point its chunks anywhere.
3. **No CSS fence yet** (**Planned**, VCST-5760). A plugin's stylesheet applies to the whole page. Prefer
   `<style scoped>`.
4. **No integrity check** of plugin files. Deferred while plugins come from our own backend.

What an environment must provide: a CSP (`'self'` covers platform plugins), and trusted hosting for anything
loaded through the override.

_Source:_ `index.ts` (`installRouteGuard`, `resolveRemotes`).
_Tests:_ `index.test.ts` "route squatting"; `platform-discovery.test.ts` "skips a plugin whose manifest is served
from another origin", "skips a plugin whose remote name could swallow another remote's loadRemote id".

## 11. When it does not work

> ⚠️ **Production logs nothing**, not even errors (`Logger` is a no-op there). Diagnose with a development build,
> `usePluginsStatus()`, or `yarn check:plugin-module`.

| Symptom                                | Likely cause                                                                      | Check                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| No plugin ever loads                   | switch off, or the override is set                                                | `settings_data.json`; the build's env                                  |
| One plugin missing on an environment   | module not installed, plugin not in the package, no `/modules` route, old backend | `check:plugin-module … --artifact` / `--env`                           |
| Plugin skipped                         | gate 1, its `when`, or a missing permission                                       | `usePluginsStatus()` (gives the reason); dev console `[MF] Skipping …` |
| Plugin failed                          | gate 2, or its `init()` threw or timed out                                        | dev console `[MF] Failed to load …`                                    |
| "Loaded" but its page is a 404         | declared route registered after an `await`                                        | move `addRoute` before the first `await` in `init()`                   |
| Blank page in a local production build | the store resolves from `localhost`                                               | build with `--mode=development`                                        |

## 12. Reference

**Commands** (run in this repo):

| Command                                                             | Does                                                |
| ------------------------------------------------------------------- | --------------------------------------------------- |
| `yarn create:plugin <name> <dir>`                                   | scaffold a standalone plugin                        |
| `yarn create:plugin <name> --module <*.Web>`                        | scaffold a plugin inside a backend module           |
| `yarn check:plugin-module <*.Web> [--artifact <zip>] [--env <url>]` | check a module, its package, an environment         |
| `yarn build:core-types`                                             | regenerate the facade contract (facade maintainers) |
| `yarn validate:core-types`                                          | fail if the committed contract is stale             |
| `yarn core:yalc-push`                                               | push an unreleased facade to linked plugins         |

**Settings:**

| Setting                          | Where                                  | Read at    |
| -------------------------------- | -------------------------------------- | ---------- |
| `module_federation_enabled`      | `client-app/config/settings_data.json` | build time |
| `APP_MODULES_FEDERATION_REMOTES` | environment                            | build time |

**Files:**

| File                              | Role                                                           |
| --------------------------------- | -------------------------------------------------------------- |
| `core/federation/bootstrap.ts`    | startup entry, the backstop                                    |
| `core/federation/index.ts`        | the loader: discovery, gates, load, `init()`                   |
| `core/federation/version-gate.ts` | gate 1                                                         |
| `core/federation/contributions/`  | declarations: apply, evaluate `when`, status, placeholder page |
| `core-api/`                       | the facade, its contract, the scaffolder and the module check  |
| `core-api/federation.mjs`         | shared libraries and plugin build options, for both sides      |
| `vite.federation.ts`              | the host's federation build                                    |

**Glossary:**

- **Host:** this storefront.
- **Plugin / remote:** a separately built bundle the host loads.
- **Facade:** `@vc-frontend/core`, the only API a plugin may use.
- **Contract:** the facade's types, `core-api/contract/index.d.ts`.
- **`mf-manifest.json`:** the plugin's build index; carries `requiredHostVersion`.
- **`plugin.json`:** the plugin's descriptor for the platform: id, expose key, `contributions`.
- **Contributions:** the declarations from `plugin.config.ts`.
- **Extension point / slot:** a place in a host page a plugin can fill.
