---
paths:
  - "**/*.vue"
  - "**/*.ts"
---

# Architecture

Module layout and routes are in `modules-and-routes.md`.

## Layers and import boundaries
Direction: `ui-kit` ← `core` ← `shared` ← `modules` / `pages`. dependency-cruiser runs in CI, but there is no rule for most of these directions — review by hand.

1. **No new upward imports**: ui-kit must not import `shared/`, `modules/`, `pages/` (and avoids new `@/core` imports — see `ui-kit-internals.md` §3); `core/` and `shared/` must not import `modules/` or `pages/`. A module surfaces in the host through its `init()` and the extension registry, never through host imports of module code.
2. **Host → `modules/sales-rep` and `modules/returns` only via their `index.ts`** (`no-host-to-sales-rep-internals`, `no-host-to-returns-internals`). dependency-cruiser doesn't see `import type`, and the ESLint copy covers sales-rep only — a deep `import type` into returns is not caught by anything; flag it.
3. **Modules never import a host `_internal/` folder** (`no-module-to-host-internal`). The two `push-messages/link-push-messages*.vue` exemptions are frozen — don't add more; add an extension point.
4. **No module-to-module imports.** Shared logic goes to `shared/` or `core/`. (`purchase-requests` → `quotes` is legacy.)
5. Federated plugins import host APIs only from `@vc-frontend/core` (`client-app/core-api/index.ts`), never `@/...`. Adding to the facade = regenerate `contract/index.d.ts` with `yarn build:core-types` and commit; never edit it by hand; breaking change → `yarn bump:core minor` (0.x) / `major` (≥1.x), update the `@vc-frontend/core` range in `federation.mjs`, commit together.
6. No devDependency imports in shipped `client-app` code, no packages missing from package.json, no imports from `*.test.ts`. New circular deps or orphans are findings.

## Extension points
7. Module UI on host pages: `useExtensionRegistry().register(category, EXTENSION_NAMES.x.y, { component: defineAsyncComponent(() => import(...)) })`. Data-only: `registerContribution(..., { use })` — `use()` must be synchronous and must not throw.
8. A new extension point needs all three edits: `extensionRegistryMap.ts`, `initialExtensionRegistry.ts`, `extensionPointsNames.ts`.
9. Async components stored in reactive state are wrapped in `markRaw(defineAsyncComponent(...))`.
10. Module Apollo type policies via `registerCacheTypePolicies`, not edits to core `cache.ts`.

## Performance
11. Don't add `await`s on the boot path of `app-runner.ts`; start requests in parallel and attach a `.catch` immediately.
12. Graceful dynamic imports call `ignoreChunkLoadFailure(error)` before logging, otherwise chunk-load recovery reloads the page.

## Legacy — don't flag, don't copy
- Existing upward imports: host → `@/modules/customer-reviews`, UI kit → `@/shared/notification`, `core` → `shared`.
