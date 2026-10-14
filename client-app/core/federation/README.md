# Module Federation in the storefront

**For:** anyone who touches the storefront host, or needs to know how plugins get into it.
**Want to do something specific?** Start at the [scenarios](./scenarios/README.md) instead.

> **TL;DR**
>
> - A **plugin** is a bundle built and deployed apart from the storefront. The storefront loads it at startup.
> - It is **on in the stock theme** from release 2.60 (`module_federation_enabled: true` in the theme settings).
>   Set it to `false` and rebuild to ship a storefront without it. Before 2.60 it was off unless the build set
>   `APP_MODULES_FEDERATION_ENABLED`; from 2.60 that variable is ignored and the setting decides.
> - Plugins usually ship **inside a backend module**. Installing the module installs the plugin; the storefront is
>   not rebuilt.
> - A plugin talks to the host only through **`@vc-frontend/core`** (the _facade_).

**How to read the claims below:** everything is implemented on `dev` unless it is marked **Planned** or **Not
verified**.
_Source-checked against `dev` @ `4b7a22d23` plus the plugin tooling (VCST-6320), facade 0.2.3,
on 2026-10-14._

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

## 2. Turning it on

1. The stock theme ships `"module_federation_enabled": true` in `client-app/config/settings_data.json`.
2. To build a storefront without it, set it to `false` and rebuild. That build has no federation code, so no plugin
   loads.
3. `sales_rep_builtin_enabled` (same file, ships `false`, temporary) runs the Sales Rep Hub built into the theme
   instead of its plugin. It is read at build time too, so one build decides for every environment it goes to:

   | Installed SalesRep | `false` (default)                                                       | `true`                  |
   | ------------------ | ----------------------------------------------------------------------- | ----------------------- |
   | ships the plugin   | the plugin's hub                                                        | the hub registers twice |
   | ships no plugin    | **no hub, and buyers lose the Sales reps page**, with no error anywhere | the built-in hub        |

   **Planned:** no released SalesRep ships the plugin yet ([TODO](./TODO.md)).

> ⚠️ Only a literal `true` turns it on. A missing key, `"true"` or `1` all mean **off**.
>
> ⚠️ The switch is read **at build time**. Flipping it on a built storefront does nothing.

With the switch off, the build contains no federation code at all and sends no plugin request.

## 3. How the storefront finds plugins

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

## 4. Declare, then implement

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

Full syntax (conditions, slot contexts, examples): [`declarations.md`](./declarations.md).

## 5. What happens at startup

```
 1. Get the list ─────── platform query (or the override). Failing ⇒ no plugins, the app still starts.
 2. Prepare ──────────── no plugin code yet:
                         • permission check   (user lacks it ⇒ skipped, nothing fetched)
                         • plugin-level when  (false ⇒ skipped, nothing fetched)
                         • placeholders, menu entries, slots from the declarations
 3. Per plugin, in parallel:
      a. fetch mf-manifest.json ─▶ GATE 1: facade version   (no ⇒ skipped)
      b. load the code ────────── ▶ GATE 2: shared libraries (no ⇒ logged, still loads)
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
4. An error while a plugin loads or runs `init()` never stops the storefront or other plugins. After that, its code
   runs with the storefront's full rights ([§9](#9-security-and-trust)): a throwing router guard breaks navigation.

Per-step budgets: `DEFAULT_MANIFEST_TIMEOUT_MS` and `DEFAULT_LOAD_TIMEOUT_MS` for `blocksBoot` plugins,
`DEFAULT_DEFERRED_TIMEOUT_MS` for the rest (`index.ts`).

## 6. Compatibility: two gates

| Gate                     | Compares                                                        | When                              | On a mismatch                                          |
| ------------------------ | --------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------ |
| **1 · Facade version**   | the plugin's `requiredHostVersion` vs the host's `CORE_VERSION` | before any plugin code is fetched | **skipped**: none of its code ran                      |
| **2 · Shared libraries** | the plugin's ranges for Vue, Apollo… vs the host's versions     | while the code loads              | **logged only**: it still loads, on the host's version |

1. Gate 1 fails closed: a missing, broken or unreadable requirement counts as "no".
2. **Gate 2 does not stop a plugin today.** The Module Federation runtime logs
   `Failed to bridge … shared module` and hands the plugin the host's copy anyway ([TODO](./TODO.md)). Gate 1
   is the one that holds.
3. A bare `"0.2.3"` means `^0.2.3`. On 0.x a new **minor** is breaking, so `^0.2.3` refuses `0.3.0`.
4. **Neither gate proves the plugin works.** They compare version numbers, not behaviour. `requiredHostVersion` is
   the plugin author's claim.

How the facade itself is versioned and released: [`core-api/README.md`](../../core-api/README.md).

## 7. The facade and shared libraries

1. **Host APIs come only from `@vc-frontend/core`.** Never `@/…`: those paths do not exist in a plugin's build.
   Importing a library itself (`vue-router`, `@vue/apollo-composable`) is fine.
2. **At compile time** `@vc-frontend/core` gives **types only** (`core-api/contract/index.d.ts`); its subpaths
   (`/federation`, `/manifest`, `/codegen`, `/testing`, `/tailwind-preset`) carry code for the plugin's build and tests.
   **At runtime** the host hands over its **live objects**: one Vue, one router, one Apollo cache.
3. The libraries that must exist once (Vue, vue-router, vue-i18n, VueUse, the Apollo client and composable,
   GraphQL, the facade) are listed in **one place**, `MF_SHARED_RANGES` in `core-api/federation.mjs`. A plugin borrows them and never bundles a copy.
   ⚠️ Except what its `vite.config.ts` sets to `false` in `sharedOverrides`: the scaffold does that for every group
   not picked. Delete the line before importing that library, or the plugin bundles a copy that does not see the
   host's (no i18n messages, no Apollo client).
4. Any other library a plugin uses is bundled into the plugin. That is fine unless the library shares state
   through `provide`/`inject` across the host/plugin line; then it must join the shared list first.

What is exported: [`core-api/index.ts`](../../core-api/index.ts), grouped and commented; the types are in
`core-api/contract/index.d.ts`. How to add to it: [`core-api/README.md`](../../core-api/README.md).

## 8. Shipping a plugin

| Way                         | How it reaches the storefront                                     | Storefront rebuild? |
| --------------------------- | ----------------------------------------------------------------- | ------------------- |
| **Inside a backend module** | the module carries `plugins/vc-frontend/`; the platform serves it | No                  |
| Hosted elsewhere            | its manifest URL goes into `APP_MODULES_FEDERATION_REMOTES`       | Yes                 |

The backend-module path, step by step: [scenario S1a](./scenarios/s1a-plugin-in-an-existing-module.md).
What every environment needs (backend floors, the `/modules` route): [scenario S6](./scenarios/s6-enable-on-an-environment.md).

`yarn check:plugin-module <module *.Web> [--artifact <zip>] [--env <storefront-url>]` checks the module, its
package and an environment.

## 9. Security and trust

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

## 10. When it does not work

Step by step, with every console message: [scenario S7](./scenarios/s7-missing-or-broken.md).

> ⚠️ **The storefront logs nothing in production**, not even errors (`Logger` is a no-op there); only the browser's
> own and the MF runtime's messages show. Diagnose with a development build or `yarn check:plugin-module`.

| Symptom                                | Likely cause                                                                      | Check                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| No plugin ever loads                   | switch off, or the override is set                                                | `settings_data.json`; the build's env                                         |
| One plugin missing on an environment   | module not installed, plugin not in the package, no `/modules` route, old backend | `check:plugin-module … --artifact` / `--env`                                  |
| Plugin skipped                         | gate 1, its `when`, or a missing permission                                       | dev console `[MF] Skipping …` (`usePluginsStatus()` gives a plugin its state) |
| Plugin failed                          | its `init()` threw or timed out, or a chunk failed                                | dev console `[MF] Failed to load …`                                           |
| "Loaded" but its page is a 404         | declared route registered after an `await`                                        | move `addRoute` before the first `await` in `init()`                          |
| Blank page in a local production build | the store resolves from `localhost`                                               | build with `--mode=development`                                               |

## 11. Reference

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
| `sales_rep_builtin_enabled`      | `client-app/config/settings_data.json` | build time |
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

---

Open work and known limits: [`TODO.md`](./TODO.md).
