# S1a · Plugin in an existing backend module

**Your case:** a backend module exists, and you want it to ship a storefront plugin.

**With Claude Code:** the `mf-new-plugin` skill runs these steps and stops for your decisions. It comes with the
`vc-frontend` plugin of the [VirtoCommerce/ai-tools](https://github.com/VirtoCommerce/ai-tools) marketplace.

**Before you start:**

1. A `vc-frontend` checkout with `yarn install` done. Its facade version (`client-app/core-api/package.json`)
   becomes the plugin's floor, `requiredHostVersion: ^<version>`: it must not be newer than the facade of the
   storefronts the plugin is for, or they skip it. It must also be released (a `core-v<version>` tag); if it is
   not, see ⚠️ 3.
2. Node 22 with corepack (`corepack enable`).
3. The module repo, and its `*.Web` project folder (the one holding `module.manifest`).
4. A backend in `.env.local` (`APP_BACKEND_URL`) for step 5.

## Steps

1. **Scaffold.** 📁 `vc-frontend`

   ```bash
   yarn create:plugin my-plugin --module ../vc-module-foo/src/VirtoCommerce.Foo.Web
   ```

   In a terminal it asks which libraries the plugin uses. Elsewhere (an agent, CI) it asks nothing, so pass `--yes`
   plus the flags you want: `--with-i18n`, `--with-apollo` (your own GraphQL, from the module's scoped schema: S1b
   step 4), `--with-vueuse`, `--with-tailwind`, `--no-router`. This creates `StorefrontApp/`, and touches nothing
   else in the module. It ends with a list of what is still to do there.

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

   ✅ `All checks passed`. A ❌ prints the line to change; a ⚠️ is something it could not check, so read it.

5. **See it in the storefront.**

   📁 `StorefrontApp`: `yarn build && yarn preview` (serves the plugin on port 3001).

   📁 `vc-frontend` (with `"module_federation_enabled": true`, the default):

   ```bash
   APP_MODULES_FEDERATION_REMOTES='{"my-plugin":"http://localhost:3001/mf-manifest.json"}' \
   yarn build-only --mode=development && yarn preview
   ```

   PowerShell or cmd: put the `APP_MODULES_FEDERATION_REMOTES=…` line in `.env.local` instead (take it out
   afterwards), and run the two commands one after the other.

   ✅ `https://localhost:3000/my-plugin` shows the plugin's page. The console says `[MF] plugins loaded=[my-plugin]`.

6. **Build the module and check its package.** Push; the module CI builds the package. Or build it yourself: 📁 module
   repo `vc-build compress`, with the .NET SDK the module targets and Node; the zip lands in `artifacts/`. Then 📁
   `vc-frontend`:

   ```bash
   yarn check:plugin-module ../vc-module-foo/src/VirtoCommerce.Foo.Web --artifact ../vc-module-foo/artifacts/VirtoCommerce.Foo_x.y.z.zip
   ```

   ✅ `plugins/vc-frontend/ sits at the zip root`.

7. **Install it on an environment**, then add `--env https://<storefront>` to the same command. What the
   environment needs: S6. A local platform works the same way: [S6 → On a local platform](./s6-enable-on-an-environment.md#on-a-local-platform).

## ✅ Done when

`check:plugin-module` passes with `--artifact` and `--env`, and the plugin's page opens on that environment.

## ⚠️ Watch out

1. **The package has the plugin under `bin/`.** The module was built without `storefront-plugin.targets`, or
   published without vc-build's `--output {moduleRoot}/bin`. The platform only looks at the package root.
2. **A declared route shows a 404.** `init()` registered it after an `await`. Register declared routes first,
   before any `await`.
3. **`yarn install` fails with a 404 on `@vc-frontend/core`.** The facade version the scaffold pinned is not
   released yet. Link a local facade with yalc ([S2.3](./s2-develop-locally.md#23-the-facade-is-extended-but-not-released)),
   or scaffold from a released `vc-frontend` commit.
4. **`corepack: not found` in the module build.** The targets run yarn through corepack, which Node 25 and later no
   longer bundle. Build with Node 22 or 24, or install it with `npm i -g corepack`. To build the module without Node
   at all, pass `-p:SkipStorefrontPlugin=true` (or set it as an environment variable for vc-build): the plugin is
   then neither built nor copied.

---

_Walked on 2026-10-13 with a scratch module, steps 1–6: the scaffold, `yarn install`, `dotnet publish`
(.NET 8), `preview` serving the built plugin, then the package check. Step 7's `--env` was run against
vcptcore-dev with the sales-rep plugin. Steps 1–5, the host side of step 5 included, were walked again on a module from the platform
template, whose `*.Web` has its own `package.json`. On 2026-10-14 the current targets went through
`dotnet publish -o <module>/bin` again: the plugin at the package root, no `StorefrontApp` file in `bin/`.
**Not verified:** a real module's CI build (net10)._
