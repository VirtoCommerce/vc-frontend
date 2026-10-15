# S7 · A plugin is missing or broken

**Your case:** a plugin does not show up, or shows up wrong.

> ⚠️ **The storefront logs nothing in production**, not even errors. Start with the browser's Network tab (step 2),
> which needs nothing installed. For the loader's own reason, run a development build (step 3).

## Steps

1. **Check the module and the environment.** 📁 `vc-frontend`, with the module's source checked out:

   ```bash
   yarn check:plugin-module ../vc-module-foo/src/VirtoCommerce.Foo.Web --artifact <package.zip> --env https://<storefront>
   ```

   Fix every ❌ first, with the fix it prints. Then go on.

2. **Read the Network tab** on the storefront, production included. Reload the page and filter by `graphql`,
   `mf-manifest` and `remoteEntry`:

   | What you see                                                              | Means                                                                                                                                                  |
   | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
   | `GetStorePlugins` answers, and its `data.store.plugins` lacks the plugin  | not installed, its package has no `plugins/vc-frontend/`, or the platform was not restarted after the install ([S6](./s6-enable-on-an-environment.md)) |
   | the plugin is listed, but nothing asks for its `mf-manifest.json`         | skipped before any download: its `permission` or its `when`                                                                                            |
   | `mf-manifest.json` answers 200, but nothing asks for its `remoteEntry.js` | gate 1: compare `metaData.requiredHostVersion` in that response with the storefront release's facade (`client-app/core-api/package.json` at its tag)   |
   | `mf-manifest.json` answers 404, or with HTML                              | the `/modules` route ([S6](./s6-enable-on-an-environment.md) step 3)                                                                                   |
   | `remoteEntry.js` or a chunk answers 404                                   | an old `remoteEntry.js` after an upgrade (below)                                                                                                       |

3. **Get the reason from the loader.** Run the storefront locally, at the release the environment runs, against
   that backend ([S2.2](./s2-develop-locally.md#22-the-module-is-already-on-the-environment)), and open the page.
   When something was skipped or failed, the console sums it up in one line:

   ```
   [MF] plugins loaded=1 failed=[] skipped=[my-plugin]
   ```

   Find the plugin's own `[MF] …` line above it, then look it up below.

## What the console says

### Nothing loads

| Console line                                     | Means                                                                                            | Do                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| _nothing with `[MF]` at all_                     | the switch was off at build time, or no plugin was listed                                        | `module_federation_enabled: true`; `--env` lists the plugins                  |
| `[MF] Could not read the platform's plugin list` | the storefront's plugin query failed: x-api below `BACKEND_REQUIREMENTS`, or the backend is down | `--env`; the backend versions ([S6](./s6-enable-on-an-environment.md) step 1) |
| `Skipping remote "…": …`                         | an `APP_MODULES_FEDERATION_REMOTES` entry is unusable; the line says why                         | fix the override ([S2](./s2-develop-locally.md))                              |

### Skipped

| Console line                                                      | Means                                                                 | Do                                                    |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| `Skipping "…": requires permission "…"`                           | the user lacks the plugin's `permission`                              | expected; sign in as a user who has it                |
| `Skipping "…": its declared \`when\` is false (…)`                | the plugin's own condition is false (a setting, say)                  | expected; change the setting if it should be on       |
| `Skipping "…": requires @vc-frontend/core …, host provides …`     | gate 1: the plugin needs another facade version                       | release them in order (S3) or upgrade the plugin (S4) |
| `Skipping "…": manifest declares no requiredHostVersion`          | the plugin was not built with the scaffold's build options            | build it with `createRemoteFederationOptions`         |
| `Skipping "…": its contributions are format …, this host reads …` | the plugin was built against a facade with another declaration format | rebuild it against this host's facade (S4)            |

### Failed

| Console line                                               | Means                                                                                                   | Do                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `Could not read/validate manifest for "…"`                 | `mf-manifest.json` did not load: 404, not JSON, or too slow                                             | `--env`; the `/modules` route ([S6](./s6-enable-on-an-environment.md)) |
| `Failed to load federated plugin "…"`                      | a chunk failed, or `init()` threw or timed out                                                          | read the error printed with it                                         |
| `[Module Federation] Failed to bridge … shared module "…"` | gate 2: the plugin wants another version of a shared library. **It still loads**, on the host's version | rebuild it against the host's facade (S4)                              |
| `"…" exposes no init() — nothing was registered`           | the expose key points at the wrong module                                                               | check `remote.exposed` in `plugin.json`                                |

### Declarations

| Console line                                    | Means                                                                                | Do                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `"…" declares route "…", … - skipped`           | a declared route cannot be placed: its `parent` does not exist, or the name is taken | fix `plugin.config.ts`; the plugin itself still loads |
| `… tried to take the route "…" declared by "…"` | a declared route was added after an `await` in `init()`, or by another plugin        | register it before the first `await`                  |
| `… tried to replace the existing route "…"`     | the plugin's route name is already a host route                                      | give the route a plugin-specific name                 |

## When the plugin loads but something is wrong

| Symptom                                                                                                       | Likely cause                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Its page says it is taking longer than usual                                                                  | the plugin is still loading after `PLACEHOLDER_SLOW_NOTICE_MS`                                                                                                                                                          |
| Its page says part of the site could not be loaded                                                            | the plugin failed: `init()` threw or ran out of time                                                                                                                                                                    |
| Its page is a 404                                                                                             | the plugin was skipped, or added its declared route after an `await`                                                                                                                                                    |
| Its widget is missing on some items                                                                           | the `condition` it was registered with is false for those items (the slot's `when` only holds the place while the plugin loads)                                                                                         |
| Its widget is missing everywhere                                                                              | registered under a name the host does not render; use `EXTENSION_NAMES`                                                                                                                                                 |
| Host pages look different once it loads                                                                       | the plugin's CSS leaks: nothing fences it yet (**Planned**, VCST-5760)                                                                                                                                                  |
| After a module upgrade: the old version, or "Part of the site could not be loaded" that a reload does not fix | an old `remoteEntry.js`, cached by a CDN or by the browser: only the manifest gets a cache-buster. Send `Cache-Control: no-cache` for it (S6 step 3) and purge the CDN; a browser drops its copy once that copy expires |
| It appears or disappears only after a reload                                                                  | `when` and `permission` are read at startup: a role or setting changed while the tab was open applies on the next page load. Signing in or out reloads the page                                                         |

## Taking a plugin out

When a plugin breaks the storefront in production, from the cheapest way out:

1. **Its plugin-level `when` setting** (`settingEnabled(<module>, <key>)` in `plugin.config.ts`): switch the setting
   off in the platform admin. Page loads after that skip the plugin, with no rebuild and no module change. Only a
   plugin that declares one has this, so declare it: the scaffold leaves it commented out in `plugin.config.ts`,
   and the module needs a public store setting for it.
2. **Its `permission`**: take the permission away from the roles. Only for a plugin that declares one.
3. **Uninstall or downgrade the module**, then restart the platform. Its backend feature goes too.
4. **Rebuild the storefront with `module_federation_enabled: false`.** Every plugin goes.

`APP_MODULES_FEDERATION_REMOTES` is not a way out: it replaces the whole list and drops every plugin's `permission`.

---

_Walked on 2026-10-13: every console line above except `requires permission` and the plugin list one was
reproduced with a broken plugin, and the pages of a slow plugin, a failed one and a late route were opened.
**Not verified:** `requires permission` (no environment plugin has one), the plugin list line (read from the code),
the Network-tab table and "Taking a plugin out" (read from the code), and the symptoms below the first three._
