# S4 · Upgrade a plugin to a new host or facade

**Your case:** a new facade version is out (or a storefront release moved one), and the plugin should move onto it.

**Before you start:** know which version the plugin is on (`requiredHostVersion` in `StorefrontApp/vite.config.ts`)
and which one is new (stable `core-v*` releases of `vc-frontend`; `-alpha` pre-releases are temporary, never a
target).

## Do you have to?

| What changed (on 0.x)                    | Old plugin on the new storefront              | You must upgrade?                     |
| ---------------------------------------- | --------------------------------------------- | ------------------------------------- |
| A **patch** (`0.2.3 → 0.2.4`): additions | still loads                                   | only to use the new exports           |
| A **minor** (`0.2.x → 0.3.0`): breaking  | **skipped** by gate 1, silently in production | **yes**, before that storefront ships |

From 1.0.0 on, read "minor" for the additions and "major" for breaking.

## Steps

1. **See what changed.** 📁 `vc-frontend`:

   ```bash
   git diff core-v0.2.3 core-v0.3.0 -- client-app/core-api/contract/index.d.ts
   ```

2. **Pin the new facade.** 📁 `StorefrontApp`: point `@vc-frontend/core` in `package.json` at the new release
   tarball, set `requiredHostVersion` to `^<new version>`, then `yarn install`. The plugin's shared-library ranges
   come with the facade package, so they move too. This raises the plugin's floor: storefronts on an older facade
   skip it from then on. So the code can change any time, but the module is released by step 6.
3. **Fix what broke.** 📁 `StorefrontApp`: `yarn type-check`, `yarn test`, `yarn build`. Strict template checking
   is on, so a renamed or removed prop on a host component fails `type-check`.
4. **Shared library on a new major** (Vue, Apollo…)? Move the plugin's own copies in `devDependencies` to the
   host's versions. They only compile the plugin, but the plugin should be compiled for the runtime it meets.
   The plugin gets the host's copy whatever its ranges say: gate 2 only logs a mismatch today.
5. **Check and try it.** 📁 `vc-frontend`: `yarn check:plugin-module <*.Web>`, then run against a local storefront
   on the new version ([S2.1](./s2-develop-locally.md#21-the-main-loop)).
6. **Release in order.** After a patch: the storefront with the new facade reaches the environment first, then the
   module. After a breaking release: deploy both to an environment together. In between, the new storefront skips
   the old plugin, or the old storefront the new one.

## ✅ Done when

The plugin builds against the new facade, `check:plugin-module` passes, and the plugin loads in a storefront on
that version.

## ⚠️ Watch out

1. **A breaking facade release silently drops every plugin that was not upgraded**, on every storefront that runs
   it. Have the upgraded module ready before that storefront ships, and release the two together (step 6).
2. **A changed prop can arrive as a patch.** The version check compares export names only, so read the contract
   diff (step 1) even for a patch.
3. **`storefront-plugin.targets` is not upgraded by any command.** When `STOREFRONT_PLUGIN_TARGETS` in
   `client-app/core-api/plugin-module.mjs` changed since your scaffold, copy it over your module's file.

---

_Source-checked on 2026-10-13 against `core-api/README.md`, `contract-versioning.mjs` and `version-gate.ts`._
