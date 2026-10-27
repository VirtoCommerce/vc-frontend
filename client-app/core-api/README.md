# `@vc-frontend/core`: the facade

**For:** whoever changes what plugins can use from the storefront. Using a plugin's API is in the
[general guide](../core/federation/README.md); the step-by-step release of a facade change is
[scenario S3](../core/federation/scenarios/s3-extend-the-facade.md).

> **TL;DR**
>
> - `index.ts` is the facade: a list of re-exports. It is **the only API plugins may use**.
> - `yarn build:core-types` turns it into one committed type file and bumps the version when the API grew.
> - Removing or renaming anything breaks every plugin: bump by hand (`yarn bump:core`).
> - Releases are tarballs on GitHub (`core-v<version>`), never npm. Never delete a stable one; alpha pre-releases
>   are temporary.

_Source-checked against `dev` @ `4b7a22d23` plus the plugin tooling (VCST-6320), facade 0.2.3,
on 2026-10-14._

---

## 1. Two lives

| When         | A plugin gets                                 | From                                               |
| ------------ | --------------------------------------------- | -------------------------------------------------- |
| Compile time | **types only**: `contract/index.d.ts`         | `yarn build:core-types`, committed                 |
| Runtime      | the host's **live objects** (router, Apollo…) | the host, through Module Federation's shared scope |

The package's root has no runtime code on purpose. Anything that tries to load it outside federation (node tooling,
a plugin build that forgot to share it) fails at once instead of pulling in host source.

## 2. What belongs in the facade

Pick the first tier that fits. A need that fits none is a change to the host, not to the facade.

| Tier                    | Export                                | Use when                                                                                         |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1. Capability           | a composable or function              | **Default.** The plugin states intent, the host does it: `useModal`, `registerCacheTypePolicies` |
| 2. Host-rendered chrome | nothing new: an extension-point entry | It must look native. The plugin contributes data; the host renders its own markup                |
| 3. Frozen component     | a `.vue` component                    | The look itself is the contract (`OrderStatus`). Its props become contract too                   |
| 4. ui-kit primitive     | a `Vc*` component                     | Only if the host registers it globally **and** a plugin template uses it                         |

1. **Small and additive.** Every export is a promise to every plugin.
2. **Functions over raw objects**, so the host can change behind them.
3. **Never export from an `_internal/` folder.** It freezes markup the host must keep free; use tier 2.
4. **Tier 2 needs the host first:** a fallback slot in the host page, then the contributed shape in
   `extensionRegistryMap.ts`. In the other order the contribution renders nothing.
5. **Facade exports are always one shared instance:** plugins get the host's `@vc-frontend/core`. `MF_SHARED_RANGES`
   in `federation.mjs` is for a library plugins import directly, not through the facade, that keeps global state or
   uses `provide`/`inject`. Left out, each plugin gets its own copy of it.

## 3. Versions

The facade has its own version, in this folder's `package.json`. It is not the storefront's version.

| Change                                         | On 0.x (now) | From 1.0.0 | Who bumps                       |
| ---------------------------------------------- | ------------ | ---------- | ------------------------------- |
| An export added; any published file changed    | patch        | minor      | `yarn build:core-types`, itself |
| An export removed or renamed                   | minor        | major      | you: `yarn bump:core <level>`   |
| A shared library (Vue, Apollo…) to a new major | minor        | major      | you                             |

1. **The automatic check sees the root contract's export names only.** A changed prop or signature on a kept
   export is breaking, yet it bumps a patch; so does a removal from `/federation`, `/manifest`, `/codegen` or
   `/testing`. Bump by hand.
2. **A plugin's `requiredHostVersion` is `^` the facade it pins** (`^0.2.4`), not the start of the line
   (`^0.2.0`): it compiled against everything up to its pin, and `check:plugin-module` fails a lower floor.
   Older storefronts then refuse it.
3. **Two PRs can take the same version.** Merge `dev` before `yarn build:core-types`.

## 4. Changing the facade

1. Edit `index.ts`.
2. `yarn build:core-types`. It regenerates `contract/` and bumps the version when it should.
3. Breaking? `yarn bump:core minor` (on 0.x), update the `@vc-frontend/core` range in `federation.mjs`, then step 2
   again.
4. `yarn validate:core-types`. **No PR check runs it**; the release does, so a stale contract would only fail there.
5. Commit `index.ts`, `contract/` and `package.json` together.

Never edit `contract/` by hand. The output is deterministic, so its diff in a PR is the review of the API change.

## 5. Releasing

1. Run the **Core Facade Release** workflow from `dev`, the default branch. It validates, packs this folder and publishes the tarball
   as a GitHub Release on tag `core-v<version>`. Plugins pin its URL:
   `https://github.com/VirtoCommerce/vc-frontend/releases/download/core-v<version>/vc-frontend-core-<version>.tgz`.
2. It refuses a version whose release or tag already exists: a new contract needs a new version. It runs only in
   `VirtoCommerce/vc-frontend`, or in a fork with the `VC_RELEASE=true` repository variable.
3. **Never delete a stable `core-v*` release or tag.** Plugins pin the tarball URL, and their lockfiles its checksum.
4. Before a release exists, plugins link the local facade with yalc: `yarn core:yalc-push`
   ([S2.3](../core/federation/scenarios/s2-develop-locally.md#23-the-facade-is-extended-but-not-released)).
5. **A plugin PR that must build or deploy before the facade reaches `dev`** (its CI, a QA environment): run the
   workflow from the facade branch. From any branch but the default one it publishes a GitHub pre-release
   `core-v<version>-alpha.<run>.<branch>`, never a stable release; pin its tarball URL and set `requiredHostVersion` to `^<that version>`. The
   host has to be a theme build of the same branch. The branch's version must not be released yet.
6. **Alphas are temporary.** The stable release of `<version>`, or of any later one, deletes every alpha below it.
   Move the plugin to a stable pin before it merges.

## 6. How the contract is built

```
 index.ts ─▶ vue-tsc emits declarations ─▶ rollup-plugin-dts inlines them ─▶ contract/index.d.ts
             (everything it reaches)        into ONE file; only shared       (self-contained, committed)
                                            packages stay as imports
```

The same run snapshots the root `tailwind.config.ts` as `contract/tailwind-preset.cjs`, so plugins use the host's
design tokens.

What fails the build:

1. **Any type error** in what the facade reaches, even outside this folder.
2. **A surviving `@/…` path** in the contract.
3. **`federation.mjs` ranges** that the root `package.json` does not satisfy.
4. **A package a published file imports but `peerDependencies` does not list.** The build prints what to add.
5. **At release:** a committed contract that differs from a fresh one, or a changed contract under an unchanged
   version, compared with the last `core-v*` tag.

The generated contract is kept out of the host's own type-check on purpose: compiled together, its ui-kit types
clash with the host's.

## 7. Files

| File                                                                       | Role                                                                       |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `index.ts`                                                                 | **The facade.** Edit this                                                  |
| `contract/`                                                                | generated: the type contract and the Tailwind preset. Never edit           |
| `package.json`                                                             | the facade's version, the published `files`, `peerDependencies`            |
| `federation.mjs`                                                           | the shared libraries and plugin build options, for host and plugins        |
| `manifest.mjs`, `manifest-format.mjs`                                      | `definePluginManifest`, condition builders, the declaration format         |
| `codegen.mjs`                                                              | GraphQL codegen settings shared by host and plugins                        |
| `testing.mjs`                                                              | mount helpers for plugin specs                                             |
| `build-types.mjs`, `contract-versioning.mjs`, `bump-version.mjs`           | the contract build, its version rules, the manual bump                     |
| `create-plugin.mjs`                                                        | `yarn create:plugin`, the plugin scaffold                                  |
| `plugin-module.mjs`, `check-plugin-module.mjs`, `backend-requirements.mjs` | a plugin inside a backend module: its build, its check, the backend floors |

Published to plugins: what `files` in `package.json` lists. The rest is tooling for this repo.
