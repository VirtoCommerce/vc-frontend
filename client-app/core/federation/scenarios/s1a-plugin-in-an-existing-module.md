# S1a · Plugin in an existing backend module

**Your case:** a backend module exists, and you want it to ship a storefront plugin.

**Before you start:**

1. A `vc-frontend` checkout with `yarn install` done. Its facade version must be released (a `core-v<version>` tag).
   If it is not, see ⚠️ 3.
2. Node 22 with corepack (`corepack enable`).
3. The module repo, and its `*.Web` project folder (the one holding `module.manifest`).
4. A backend in `.env.local` (`APP_BACKEND_URL`) for step 5.

## Steps

1. **Scaffold.** 📁 `vc-frontend`

   ```bash
   yarn create:plugin my-plugin --module ../vc-module-foo/src/VirtoCommerce.Foo.Web
   ```

   Add `--with-apollo` for your own GraphQL, `--with-tailwind` for Tailwind. This creates
   `StorefrontApp/`, and touches nothing else in the module. It ends with a list of what is still to do there.

2. **Wire the module.** 📁 module repo

   Add the lines that list printed:

   | File              | Line                                                                          |
   | ----------------- | ----------------------------------------------------------------------------- |
   | `*.Web.csproj`    | `<Import Project="StorefrontApp\storefront-plugin.targets" />`                |
   | `module.manifest` | the `platformVersion` and `<dependency …>` floors from `BACKEND_REQUIREMENTS` |
   | `.gitignore`      | `/src/<Module>.Web/plugins/`, the build output                                |

   Your module CI must have Node; the standard `module-ci.yml` sets it up.

3. **Lock the plugin's dependencies.** 📁 `StorefrontApp`

   ```bash
   yarn install
   ```

   Commit `yarn.lock`: the module build installs with `--immutable`.

4. **Check the module.** 📁 `vc-frontend`

   ```bash
   yarn check:plugin-module ../vc-module-foo/src/VirtoCommerce.Foo.Web
   ```

   ✅ `All checks passed.` Every ❌ prints the line to change.

5. **See it in the storefront.**

   📁 `StorefrontApp`: `yarn build && yarn preview` (serves the plugin on port 3001).

   📁 `vc-frontend`: set `"module_federation_enabled": true` in `client-app/config/settings_data.json` (don't
   commit it), then:

   ```bash
   APP_MODULES_FEDERATION_REMOTES='{"my-plugin":"http://localhost:3001/mf-manifest.json"}' \
   yarn build-only --mode=development && yarn preview
   ```

   ✅ `https://localhost:3000/my-plugin` shows the plugin's page. The console says `[MF] plugins loaded=[my-plugin]`.

6. **Build the module and check its package.** Push; the module CI builds the package. Download it, then 📁
   `vc-frontend`:

   ```bash
   yarn check:plugin-module ../vc-module-foo/src/VirtoCommerce.Foo.Web --artifact VirtoCommerce.Foo_x.y.z.zip
   ```

   ✅ `plugins/vc-frontend/ sits at the zip root`.

7. **Install it on an environment**, then add `--env https://<storefront>` to the same command. What the
   environment needs: S6.

## ✅ Done when

`check:plugin-module` passes with `--artifact` and `--env`, and the plugin's page opens on that environment.

## ⚠️ Watch out

1. **The package has the plugin under `bin/`.** The module was built without `storefront-plugin.targets`, or
   published without vc-build's `--output {moduleRoot}/bin`. The platform only looks at the package root.
2. **A declared route shows a 404.** `init()` registered it after an `await`. Register declared routes first,
   before any `await`.
3. **`yarn install` fails with a 404 on `@vc-frontend/core`.** The facade version the scaffold pinned is not
   released yet. Link a local facade with yalc (S3), or scaffold from a released `vc-frontend` commit.

---

_Walked on 2026-10-13 with a scratch module, steps 1–6: the scaffold, `yarn install`, `dotnet publish`
(.NET 8), `preview` serving the built plugin, then the package check. Step 7's `--env` was run against
vcptcore-dev with the sales-rep plugin. **Not verified:** a real module's CI build (net10), and step 5's host side
with a `--module` scaffold._
