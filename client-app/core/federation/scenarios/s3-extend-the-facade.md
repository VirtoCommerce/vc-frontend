# S3 · Extend the facade and release it

**Your case:** a plugin needs a host API that `@vc-frontend/core` does not export yet.

**Before you start:** check that the need fits the facade. Prefer a composable or function (`useModal`), a data
contribution the host renders, or a component only when its look is the contract. The rules:
[`core-api/README.md` → What belongs in the facade](../../../core-api/README.md#2-what-belongs-in-the-facade).

## The order things must happen in

```
 vc-frontend PR ─▶ merged to dev ─▶ facade released ─▶ storefront release ─▶ plugin's module
 (export + contract)                (core-v<version>)  deployed with it      released with the new pin
                                                                              │
             develop the plugin against the unreleased facade with yalc ◀────┘ (S2.3)
```

> ⚠️ If the plugin reaches an environment **before** a storefront with the new facade, gate 1 skips it there, and
> production logs nothing.

> **Not on the VirtoCommerce team?** Only `VirtoCommerce/vc-frontend` releases the facade. Open the PR there and work
> against it with yalc meanwhile (S2.3); the plugin ships once the release and a storefront that carries it are out.
> If the need is small, copy the code into the plugin instead.

## Steps

1. **Add the export.** 📁 `vc-frontend`: one re-export line in `client-app/core-api/index.ts`.
2. **Regenerate the contract.** 📁 `vc-frontend`:

   ```bash
   git fetch origin && git merge origin/dev   # first: another PR may have taken the next version already
   yarn build:core-types
   ```

   This rewrites `contract/index.d.ts` and bumps the facade version (a patch on 0.x). Never edit the contract by
   hand.

3. **Removed or renamed an export?** That is breaking: the build refuses to bump on its own. Run
   `yarn bump:core minor` (on 0.x), update the `@vc-frontend/core` range in `core-api/federation.mjs`, then
   `yarn build:core-types` again. It refuses until the range includes the new version. When the removal drops the facade's
   last import of a library, it also prints the `peerDependencies` to write into `core-api/package.json`.
4. **Verify, because no PR check does it for you:** 📁 `vc-frontend`: `yarn validate:core-types`.
5. **Commit together** `index.ts`, the `contract/` files and `core-api/package.json`. Open the PR.
6. Meanwhile, develop the plugin against your checkout with yalc ([S2.3](./s2-develop-locally.md#23-the-facade-is-extended-but-not-released)).
7. **After the merge, release the facade.** Run the _Core Facade Release_ workflow from `dev`. It publishes
   `core-v<version>`.
8. **Pin the release in the plugin.** 📁 `StorefrontApp`: `yalc remove @vc-frontend/core`, point
   `@vc-frontend/core` at the new release tarball, set `requiredHostVersion` to `^<version>`, then `yarn install`.
   📁 `vc-frontend`: `yarn check:plugin-module <*.Web>` ✅.
9. **Release the plugin's module only after** a storefront with that facade is on the environment.

## ✅ Done when

The `core-v<version>` release exists, the plugin pins it, `check:plugin-module` passes with `--env`, and the plugin's
page or widget shows on that environment: `--env` does not see gate 1.

## ⚠️ Watch out

1. **Two facade PRs can take the same version.** Merge `dev` before `build:core-types`, and again before merging.
2. **A changed prop on an exported component is breaking, yet the bump stays a patch:** the check compares export
   names only. Bump by hand (`yarn bump:core minor`).
3. **Never delete a `core-v*` release or tag.** Every plugin pinned to it stops installing.

---

_Walked on 2026-10-13 up to the PR, steps 1–4: an added export, a removed one through `bump:core minor`, and a
renamed prop for ⚠️ 2. **Not verified:** steps 7–9, the release._
