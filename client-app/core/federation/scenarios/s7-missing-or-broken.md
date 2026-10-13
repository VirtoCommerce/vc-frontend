# S7 · A plugin is missing or broken

**Your case:** a plugin does not show up, or shows up wrong.

> ⚠️ **Production logs nothing**, not even errors. To see why a plugin was skipped or failed, run a development
> build of the storefront against the same backend ([S2.2](./s2-develop-locally.md#22-the-module-is-already-on-the-environment))
> and read the console.

## Steps

1. **Check the module and the environment.** 📁 `vc-frontend`, with the module's source checked out:

   ```bash
   yarn check:plugin-module ../vc-module-foo/src/VirtoCommerce.Foo.Web --artifact <package.zip> --env https://<storefront>
   ```

   Fix every ❌ first: each one prints the fix. Then go on.

2. **Get the reason from the loader.** Run the storefront locally against that backend (S2.2) and open the page.
   When something was skipped or failed, the console sums it up in one line:

   ```
   [MF] plugins loaded=1 failed=[] skipped=[my-plugin]
   ```

   Find the plugin's own `[MF] …` line above it, then look it up below.

## What the console says

| Console line                                                      | Means                                                                                                   | Do                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| _nothing with `[MF]` at all_                                      | the switch was off at build time, or no plugin was listed                                               | `module_federation_enabled: true`; `--env` lists the plugins           |
| `Skipping "…": requires permission "…"`                           | the user lacks the plugin's `permission`                                                                | expected; sign in as a user who has it                                 |
| `Skipping "…": its declared \`when\` is false (…)`                | the plugin's own condition is false (a setting, say)                                                    | expected; change the setting if it should be on                        |
| `Skipping "…": requires @vc-frontend/core …, host provides …`     | gate 1: the plugin needs another facade version                                                         | release them in order (S3) or upgrade the plugin (S4)                  |
| `Skipping "…": manifest declares no requiredHostVersion`          | the plugin was not built with the scaffold's build options                                              | build it with `createRemoteFederationOptions`                          |
| `Skipping "…": its contributions are format …, this host reads …` | the plugin was built against a facade with another declaration format                                   | rebuild it against this host's facade (S4)                             |
| `Skipping remote "…": …`                                          | an `APP_MODULES_FEDERATION_REMOTES` entry is unusable; the line says why                                | fix the override ([S2](./s2-develop-locally.md))                       |
| `Could not read/validate manifest for "…"`                        | `mf-manifest.json` did not load: 404, not JSON, or too slow                                             | `--env`; the `/modules` route ([S6](./s6-enable-on-an-environment.md)) |
| `Failed to load federated plugin "…"`                             | a chunk failed, or `init()` threw or timed out                                                          | read the error printed with it                                         |
| `[Module Federation] Failed to bridge … shared module "…"`        | gate 2: the plugin wants another version of a shared library. **It still loads**, on the host's version | rebuild it against the host's facade (S4)                              |
| `"…" exposes no init() — nothing was registered`                  | the expose key points at the wrong module                                                               | check `remote.exposed` in `plugin.json`                                |
| `"…" declares route "…", … - skipped`                             | a declared route cannot be placed: its `parent` does not exist, or the name is taken                    | fix `plugin.config.ts`; the plugin itself still loads                  |
| `… tried to take the route "…" declared by "…"`                   | a declared route was added after an `await` in `init()`, or by another plugin                           | register it before the first `await`                                   |
| `… tried to replace the existing route "…"`                       | the plugin's route name is already a host route                                                         | give the route a plugin-specific name                                  |

## When the plugin loads but something is wrong

| Symptom                                            | Likely cause                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| Its page says it is taking longer than usual       | the plugin is still loading after `PLACEHOLDER_SLOW_NOTICE_MS`          |
| Its page says part of the site could not be loaded | the plugin failed: `init()` threw or ran out of time                    |
| Its page is a 404                                  | the plugin was skipped, or added its declared route after an `await`    |
| Its widget is missing on some items                | the slot's `when` is false for those items                              |
| Its widget is missing everywhere                   | registered under a name the host does not render; use `EXTENSION_NAMES` |
| Host pages look different once it loads            | the plugin's CSS leaks: nothing fences it yet (**Planned**, VCST-5760)  |
| An old version keeps showing                       | a cached `mf-manifest.json`; reload with the cache disabled             |
| It stops appearing after you sign in or out        | `when` is evaluated once at startup; reload the page                    |

---

_Walked on 2026-10-13: every console line above except `requires permission` was reproduced with a broken plugin,
and the pages of a slow plugin, a failed one and a late route were opened. **Not verified:** `requires permission`
(no environment plugin has one), and the symptoms below the first three._
