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
                                              └─ /modules/*   ─▶ platform: plugin files   ← often missing
```

## Steps

1. **Backend versions.** The platform, `VirtoCommerce.Xapi` and `VirtoCommerce.XFrontend` must be at least what
   `BACKEND_REQUIREMENTS` lists. The module's own `module.manifest` declares the same floors. The `--env` check in
   step 6 reads the installed x-api and x-frontend versions and flags one that is too old; the platform version it
   cannot see.
2. **Install the module.** On our dev environments: add its package to `backend/packages.json` on that
   environment's branch of `vc-deploy-dev`.
3. **Route `/modules` to the platform** in the ingress. In `vc-deploy-dev`, add this to the environment's yml:

   ```yaml
   - path: /modules
     route: platform
   ```

4. **Deploy a storefront built with the switch on** (`module_federation_enabled: true`). A storefront built with it
   off has no plugin code at all, whatever the backend serves.
5. **CSP**, if the environment sets one: `'self'` covers plugins served by the platform.
6. **Check.** 📁 `vc-frontend`:

   ```bash
   yarn check:plugin-module ../vc-module-foo/src/VirtoCommerce.Foo.Web --env https://<storefront>
   ```

## ✅ Done when

`--env` passes, and the plugin's page or widget shows for a user who should see it.

## ⚠️ Watch out

1. **A plugin with a `permission` loads only for users who have it.** Check with such a user, not anonymously.
2. **The storefront's facade must satisfy the plugin's `requiredHostVersion`.** If it does not, the plugin is
   skipped without a word: production logs nothing. Compare the plugin's range with the storefront release's
   `client-app/core-api/package.json` version.
3. **An automated update can swap the module package** for a build without the plugin. Run `--env` again after one.

---

_Source-checked on 2026-10-13. `--env`, with its module-version check, was run against vcptcore-dev and vcst-qa._
