# Module Federation: open work

Open items only, one line each. What is done is in git history; decisions are in [`core/specs/`](../specs/).
_Checked against `dev` on 2026-10-27._

## Releasing sales-rep as a plugin

- [ ] **Check the released SalesRep package** (3.1014.0) with `yarn check:plugin-module … --artifact`.
- [ ] **`/modules → platform` route on every environment** that runs the theme (S6).
- [ ] **Release notes**: the built-in Sales Rep Hub and its `sales_rep_builtin_enabled` setting are gone, so the hub
      and the buyers' Sales reps page need SalesRep 3.1014.0 or later and the `/modules` route to the platform (S6);
      themes that set `module_federation_enabled` to `false` per the 2.60.0 notes must set it back to `true`; the
      bundle cost of the MF host; MF is a preview, and an installed plugin runs with the storefront's full rights.
- [ ] **The module's own README**: a "Storefront plugin" section that links the scenarios.
- [ ] **E2E smoke** in vc-testing-module: the plugin loads, a rep sees the hub menu.
- [ ] **Backend:** any SalesRep version crashes a platform running `ASPNETCORE_ENVIRONMENT=Development`
      (`ValidateOnBuild` rejects a scoped resolver in a singleton). Every local platform hits it. Fix in review:
      [VCST-6476](https://virtocommerce.atlassian.net/browse/VCST-6476).

## Loader and platform

- [ ] [VCST-5760](https://virtocommerce.atlassian.net/browse/VCST-5760): fence plugin CSS with cascade layers.
- [ ] [VCST-5762](https://virtocommerce.atlassian.net/browse/VCST-5762): the host wins over a plugin in the
      extension registry, whatever the order.
- [ ] **`Cache-Control` on `/modules/**`**: `immutable` for hashed assets, `no-cache` for `remoteEntry.js`,
      `mf-manifest.json`, `plugin.json`. Also: the storefront ingress must not cache 404s.
- [ ] **The platform caches its plugin list for the process lifetime**, so a newly installed plugin needs a
      platform restart.
- [ ] [VCST-6330](https://virtocommerce.atlassian.net/browse/VCST-6330): **gate 2 does not gate.** A plugin built for `vue-router ^5` loads on the host's 4.x: the runtime only logs
      `Failed to bridge … shared module`, so `strictVersion` in `federation.mjs` never fails a plugin. Its comment
      there still says it throws, and points at a README heading that is now "Compatibility: two gates": fix both with
      the next facade change, since any edit to that file bumps the facade.
- [ ] **A guard for routes a plugin registers itself** (declared routes have `when`; the rest have nothing).
- [ ] **A declared route cannot carry layout meta**: the parent's layout shows until the plugin settles.
- [ ] **Reserved-box sizes** for slots other than `productCard/card-button` and `block`.
- [ ] **Production telemetry** for failed and skipped plugins and backstop overruns (Application Insights).
      Production logs nothing today.

## Facade

- [ ] **Export the whole ui-kit barrel.** Blocked by: swiper's subpath types, the file-uploader `status` type
      clash, and the generator not resolving `export *`.
- [ ] **Detect breaking changes beyond export names** (signatures, props), or require a human classification.
- [ ] **Watch the subpaths' exports too**: a removal from `/federation`, `/manifest`, `/codegen` or `/testing`
      gets an automatic patch bump today.
- [ ] **Put `validate:core-types` back into `yarn validate`**, with the `dev` baseline fetched in CI.

## Plugin tooling

- [ ] **Bump `@module-federation/vite` past `MF_VITE_TYPE_IMPORT_FIX`** (`create-plugin.mjs`), then drop the scaffold's
      typed-document alias.
- [ ] **Ship the facade mock from the package**, with a guard that every export has a mock entry.
- [ ] **Scaffold defaults:** vue-i18n and @vueuse/core on; `checkUnknownComponents` instead of `strictTemplates`;
      pre-commit hooks; print the absolute target path in the next steps.
- [ ] **CI:** scaffold → install → build in CI, a live `loadRemote` smoke, and `check:plugin-module` in module CI.

## Later (not designed)

- Isolation between plugins (route paths, extension keys); a per-plugin kill switch; SSR for plugin routes; a
  plugin ↔ storefront version registry; per-store remote lists against a per-environment CSP; a CSP at the
  ingress at all.
