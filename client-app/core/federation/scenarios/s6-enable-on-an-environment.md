# S6 · Enable a plugin on an environment

**Your case:** a module ships a plugin, and you want it working on an environment (dev, QA, a customer's).

**Before you start:**

1. The module package passes `yarn check:plugin-module <*.Web> --artifact <zip>` ([S1a](./s1a-plugin-in-an-existing-module.md),
   step 6).
2. Access to install modules on that environment, and to its storefront deployment and ingress.

## What the environment needs

```
 Browser ── https://<storefront> ──▶ ingress ─┬─ /            ─▶ storefront (switch ON)
                                              ├─ /graphql     ─▶ platform: store.plugins
                                              └─ /modules     ─▶ platform: plugin files ← often missing
```

## Steps

1. **Backend versions.** The platform, `VirtoCommerce.Xapi` and `VirtoCommerce.XFrontend` must be at least what
   `BACKEND_REQUIREMENTS` lists. The module's own `module.manifest` declares the same floors. The `--env` check in
   step 6 reads the installed x-api and x-frontend versions and flags one that is too old; the platform version it
   cannot see.
2. **Install the module** the way the environment installs modules (the platform's Modules page, or your
   deployment), then restart the platform: it reads the plugin list once, at startup. On our dev environments: add
   its package to `backend/packages.json` on that environment's branch of `vc-deploy-dev`.
3. **Route the plugin files to the platform** in whatever sits in front of the storefront (an ingress, a reverse
   proxy), on the storefront's own origin: the storefront refuses plugin files served from another one. Routing all
   of `/modules` is the simplest; it also puts every module's admin files on the storefront's origin. To route only
   the plugin files, use a pattern (nginx: `location ~ ^/modules/[^/]+/plugins/vc-frontend/`) or one prefix per
   plugin module (`/modules/$(VirtoCommerce.Foo)/plugins/vc-frontend/`). The `$( )` is literal: that is how the
   platform names a module's folder, so a path with the bare module id matches nothing. On `vc-deploy-dev`, add
   this to the environment's yml:

   ```yaml
   - path: /modules
     route: platform
   ```

   Send `Cache-Control: no-cache` for `remoteEntry.js`, `mf-manifest.json` and `plugin.json` there, and keep a CDN
   from caching them. `remoteEntry.js` keeps its name across module versions, and the platform sends no
   `Cache-Control`, so browsers keep a copy by guesswork; after an upgrade that copy asks for chunks that are gone,
   and purging the CDN does not reach it.

4. **Deploy a storefront built with the switch on** (`module_federation_enabled: true`, release 2.60 or later). A
   storefront built with it off has no plugin code at all, whatever the backend serves.
5. **CSP**, if the environment sets one: `'self'` covers plugins served by the platform.
6. **Check.** 📁 `vc-frontend`:

   ```bash
   yarn check:plugin-module ../vc-module-foo/src/VirtoCommerce.Foo.Web --env https://<storefront>
   ```

## On a local platform

The same steps, with nothing to deploy:

1. **Install the module** from its zip (S1a step 6) in the platform admin, under Modules, then restart the platform.
   It reads the plugin list once, at startup.
2. **Skip the ingress:** the local storefront's server proxies `/modules/*/plugins/vc-frontend/` to
   `APP_BACKEND_URL` itself.
3. **Run the storefront against it:** [S2.2](./s2-develop-locally.md#22-the-module-is-already-on-the-environment), with
   `APP_BACKEND_URL` set to the platform.
4. **Check:** `--env` takes the platform's URL as it is (`--env http://localhost:8090`).

## ✅ Done when

`--env` passes, and the plugin's page or widget shows for a user who should see it.

## ⚠️ Watch out

1. **A plugin with a `permission` loads only for users who have it.** Check with such a user, not anonymously.
2. **The storefront's facade must satisfy the plugin's `requiredHostVersion`.** If it does not, the plugin is
   skipped without a word: production logs nothing. Compare the plugin's range (`--env` prints it) with the facade
   of the storefront's release: the footer shows the release (`Ver. x.y.z`), and its facade is
   `client-app/core-api/package.json` at that tag.
3. **An automated update can swap the module package** for a build without the plugin, and the feature is gone with no
   error. SalesRep does exactly that until a SalesRep release ships the plugin. Run `--env` again after an update.

---

_Source-checked on 2026-10-13. `--env`, with its module-version check, was run against vcptcore-dev and vcst-qa. The
local-platform section was walked on 2026-10-13: a template module with a plugin, built with `vc-build compress`,
installed through the platform API, found by a local storefront through `store.plugins` and rendered._
