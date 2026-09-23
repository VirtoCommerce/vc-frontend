# Federated Modules — TODO / open work

Tracking for **VCST-5159**. Backlog, except where a section says otherwise (#2 has shipped).
An item that has a work item is a one-line link — its detail lives in Jira. Everything else here
has no work item.
Decisions, rationale, and review analysis live in [`specs/`](./specs/)
(discovery/hosting/enablement: [`2026-07-06-discovery-hosting-decision.md`](./specs/2026-07-06-discovery-hosting-decision.md);
facade distribution: [`2026-07-06-facade-distribution-design.md`](./specs/2026-07-06-facade-distribution-design.md)).
Roughly in priority order.

---

## 0. Release 2.58.0 follow-ups (recorded 2026-09-11)

What the release-readiness pass found. Numbers were measured on `vcptcore-qa1` with theme build
`bb5f1147` and `VirtoCommerce.SalesRep` 3.1009.0-pr-13; items already tracked elsewhere in this
file are cross-referenced, not repeated.

**Before the theme release**

- [ ] **Switch the storefront over to the plugin.** Cut out of #2481, so that PR lands the MF host
      harness and changes nothing at runtime: `module_federation_enabled` ships `false` and the
      in-repo `client-app/modules/sales-rep` still initializes and still serves the hub. Three edits,
      all here, once the items below are done on the target environment:
      1. `client-app/config/settings_data.json` — `module_federation_enabled: true`. Two specs read
         the shipped file on purpose (`bootstrap.test.ts` "is a no-op with the theme config as
         shipped", `boot-order.test.ts` "issues nothing with the theme config as shipped") and will
         go red; rewrite them to pin the new shipped value rather than deleting them.
      2. `client-app/app-runner.ts` — comment out the `@/modules/sales-rep` import and the
         `void initSalesRep(router, i18n)` call (leave the module in the tree; its specs keep running).
      3. `client-app/modules/federated/boot-order.test.ts` — drop the then-unused
         `vi.mock("@/modules/sales-rep", …)`.

      **Edits 1 and 2 must ship together.** With the switch on and `initSalesRep` still running, an
      environment that installs `VirtoCommerce.SalesRep` ≥ 3.1009.0 registers Sales Rep Hub routes
      and menu entries twice — once from the in-repo module, once from the plugin.

      **Do not flip before the plugin reaches parity with the in-repo module.** #2439 (documents
      library), #2444 (all customer orders), #2468 (focus-ring a11y) and #2474 (rule chips on
      `VcTabSwitch`) all landed after the plugin's port base — about 7.5 k lines across 70 files,
      13 locale files included. Switching today is a feature regression on top of the availability
      risk. See the port item further down.

      Turning the switch on also costs **+159 KB gzip across the build (+9 %), ≈ +67 KB gzip of it on
      the initial payload**, plus one `store.plugins` query awaited during boot — which is why it
      ships `false` until there is a plugin to load.
- [ ] **`/modules → platform` route on every environment that runs the theme.** Only `vcptcore-qa1`
      has it; `vcst-qa`, `vcst-dev`, `vcptcore-dev`, `vcptcore-qa` do not (checked 2026-09-11) —
      there the manifest 404s and Sales Rep Hub is silently absent. One `<TICKETS>-<env>-deployment`
      PR per env branch in vc-deploy-dev.
- [ ] **Release `vc-module-sales-rep` 3.1009.0** (un-draft #13). The marketplace's latest is
      3.1008.0, which carries no plugin: theme 2.58 + module ≤ 3.1008 = no Sales Rep Hub at all. The
      release runs through the shared `vc-build QuickRelease` workflow, which pins no Node while
      `module-ci` pins Node 24 — check that the runner built `StorefrontApp`, and `unzip -Z1` the
      zip: `plugins/vc-frontend/` must sit at the module root (the first PR artefact had it under
      `bin/`).
- [ ] **Release notes for 2.58.0.** MF is a preview. Version matrix: theme ≥ 2.58.0, SalesRep ≥
      3.1009.0, x-api ≥ 3.1020.0 (the module's own floor; `store.plugins` itself needs 3.1016.0),
      x-frontend ≥ 3.1005.0; Customer ≥ 3.1024.0 and ProfileExperienceApi ≥ 3.1018.0 come from the
      2.58 page context, not from MF. The `/modules` route. What happens when any of it is missing:
      the storefront boots, the hub is absent, nothing is logged in prod. The switch is build-time
      only. A module shipping `plugins/vc-frontend/` runs its code in every visitor's browser with
      the host's full privileges — install trusted modules only. Known limits: boot waits for the
      plugins, no prod telemetry, an externally hosted plugin needs a host rebuild plus CSP.
- [ ] **Module README, "Storefront plugin" section**: needs theme ≥ 2.58.0 and the route; how to see
      the plugin loaded (`mf-manifest.json` → 200 in the network tab); why the hub is missing
      (404 = no route, `skipped` = facade or shared-library version).
- [ ] **DevOps checklist for a new environment**: the `/modules` route; the storefront nginx must
      not cache 404s (Cloudflare kept one per `Accept-Encoding` variant for hours after a redeploy —
      the 2026-09-11 blank page); `Cache-Control` on `/modules/**` — next item.

**Plugin developer experience (walked end to end 2026-09-14)**

- [x] **Toolchain parity for a scaffolded plugin** — #2480: eslint, prettier, editorconfig, vitest
      (with the facade alias and a mock), `.vscode`, `packageManager`, `strictTemplates`, the
      lint/format/test scripts, and a warning when the pinned facade version has no release tag.
- [x] **GraphQL codegen for a plugin with its own xAPI** — #2480: `--with-apollo` emits `codegen.ts`,
      `.env.example` and a sample document, and the scalars live in `@vc-frontend/core/codegen`,
      which the host's own generator now imports too.
- [ ] **Ship the facade mock from the package instead of copying it per plugin**, with a
      build-types guard that fails when a facade export has no mock entry. Today each plugin's copy
      drifts on its own.
- [ ] **Pre-commit hooks in the scaffold** (husky + lint-staged), which sales-rep also added by hand.
- [ ] **Default vue-i18n (and probably @vueuse/core) to on in the scaffolder.** The cost of the two
      answers is not symmetric: answering "no" drops the package from MF shared while leaving it in
      devDependencies, so a later `import { useI18n } from "vue-i18n"` compiles and bundles a SECOND
      copy with its own locale state — silent breakage. Answering "yes" for a package the plugin
      never imports leaves a shared entry with `import: false` that nothing ever loads.
- [ ] **Next-steps output prints a `cd ../../../../../..` path** — print the absolute target instead.
- [ ] **Consider `vueCompilerOptions.strictTemplates` in the scaffolded tsconfig.** With the
      GlobalComponents augmentation (#2480) a known component is fully typed, but an unknown one is
      still accepted silently, so a misspelled tag stays a runtime-only failure. Strict templates
      also check unknown attributes. The sales-rep plugin uses only facade-exported components
      (21 of them, all exported), so it would not be held back by this.
- [ ] **Module CI does not type-check the storefront plugin.** `vc-build Compress` runs
      `yarn build` (vite only), so `yarn type-check` never runs and the plugin ships red today:
      `layout-edit-button.vue` passes `size="xssss"` and `variant="123"` to `VcButton`, and
      `my-customers.vue` calls `$d(item.lastOrder.createdDate)` with a string where vue-i18n wants
      `number | Date` (that one only became visible once the contract started typing slot props).
      Fix the three in vc-module-sales-rep#13 and add the step to `module-ci`.
- [ ] **Publish the whole ui-kit barrel from the facade, not a hand-picked subset.** `app.use(uiKit)`
      registers **93** components globally, so a plugin template can write any of them unimported;
      only the ones `core-api/index.ts` re-exports reach the contract's `GlobalComponents`
      augmentation. #2480 takes that from 22 to 35 — the ones the sales-rep module actually uses —
      but the list is maintained by hand next to a list it has to equal, which is why it has now
      drifted three times (the host's own augmentations were missing `VcLink` and `VcTableColumn`;
      the facade's 22 were missing 13). The decided direction is to export the barrel wholesale.
      Measured 2026-09-21 by actually adding `export * from "@/ui-kit/components"` and running
      `yarn build:core-types` — three things block it, none of them the contract's size:
      1. `swiper` becomes a type peer (host is on 12.1.2), and the rolled contract then fails
         `TS2614: Module '"swiper"' has no exported member 'SwiperOptions'` — swiper keeps that type
         in a subpath, and rollup-plugin-dts writes a bare `from "swiper"`.
      2. `TS2430` twice in the file-uploader types: `IUploadingFile` extends `INewFile` and
         `IUploadedFile` extends `IUploadingFile` with an incompatible `status` discriminant. The
         host never sees it; the contract's isolation type-check does. Fixing it means editing
         ui-kit.
      3. `export *` has no export clause, so `uiKitComponentExports()` (build-types.mjs, it reads
         `ts.isNamedExports`) returns nothing and the augmentation comes out empty — the probe still
         reported `declared 22 global component(s)`. The generator has to resolve the barrel.
      Until all three are done, a component added to ui-kit is silently untyped for every plugin.
- [ ] **The version guard only watches `contract/index.d.ts` and `contract/tailwind-preset.cjs`.**
      `build-types.mjs` diffs those two against the base ref to decide the bump and to refuse an
      auto-bump on a removed export; the other published entry points — `federation.d.mts`,
      `testing.d.mts`, `tailwind-preset.d.cts` and (after #2480) `codegen.d.mts`, all listed in
      `package.json` `files` — are not read at all.
      So an export can be deleted from `@vc-frontend/core/federation` with the version untouched,
      and `^0.1.x` plugins keep resolving a package that no longer has it. That is exactly what
      #2481 does to `isMfFlagEnabled` (harmless in fact: nothing imports it and only `core-v0.1.0`
      is released). Fold the subpath `.d.mts` files into `extractExportNames`' input so a removal
      there demands the same pre-1.0 MINOR as a removal from the main contract.

**Soon after**

- [ ] **`Cache-Control` for `/modules/**`** (platform / x-frontend). The platform sends none, so
      Cloudflare answers `BYPASS` and browsers fall back to heuristic caching: `immutable` for the
      hashed `assets/*`, `no-cache` for `remoteEntry.js`, `mf-manifest.json`, `plugin.json`.
- [ ] **Boot cost with a plugin installed.** The sales-rep plugin declares no `permission` (it also
      serves buyer-facing widgets), so every visitor loads it before the router is installed:
      ~115 KB raw on the critical path, the manifest fetched twice (gate + runtime), about six
      sequential round trips to the platform on a cold cache — measured ≈ 150 ms warm and
      ≈ 1.5–2 s cold at ~350 ms RTT. [VCST-5761](https://virtocommerce.atlassian.net/browse/VCST-5761)
      (#1, #2504) takes a declared plugin's code off that path; the fetch-hook seeding (#3) is the rest.
      For the record: the MF host itself costs +159 KB gzip over an MF-off build of the same commit
      (+9 %), ≈ +67 KB gzip of it on the initial `index.html` payload.
- [ ] **Delete the in-repo `client-app/modules/sales-rep`** once QA signs the plugin off and the
      switch above is flipped — until then it is the live implementation, not dead code, so this is
      strictly the step after it. Take `PORT_TO_MF.md`, the `independentModules` entry in
      `scripts/graphql-codegen/generator.ts` and a `types.ts` regeneration with it.
- [ ] **E2E**: vc-testing-module has no Sales Rep Hub coverage at all — add a smoke (plugin loaded,
      hub menu visible for a rep) so the plugin path is not manual-only.
- [ ] **Port #2439 / #2444 into the plugin** once facade `0.1.2` (#2480) is released;
      `requiredHostVersion: "^0.1.2"`. Also #2468 and #2474, which need no new facade export.
      This is the parity gate for the switch-over item at the top.
- [ ] **Module (backend owners)**: any SalesRep version crashes a platform running
      `ASPNETCORE_ENVIRONMENT=Development` — `ValidateOnBuild` rejects the scoped
      `SalesRepRoleResolver` consumed from XCart's singleton `CanAccessCartAuthorizationHandler`.
      That is every customer's local platform. Candidate fix: a singleton resolver caching via
      `IPlatformMemoryCache` with `SecurityCacheRegion.CreateChangeToken()`.
- [ ] The plugin's `useSalesRepsConfig.ts` comment says `SalesRep.Enabled` defaults to `false`;
      `ModuleConstants` says `true`. Fix with the next plugin PR.

Cross-references: prod telemetry for failed/skipped plugins (#6), CSP at the ingress (#4),
`validate:core-types` back into `yarn validate` (#5 — expect the known false red from vue-tsc's
VcButton `tabindex` ordering artefact).

## 1. Pilot: the sales-rep storefront plugin

Prove the full loop (build → host → gate → `loadRemote` → `init`) with a real feature.
Definition and rationale: *Pilot* section of the discovery spec.

- [x] **Publish the first facade release** (`core-v0.1.0`, 2026-09-10) — run the *Core Facade Release* workflow once so the
      `core-v<CORE_VERSION>` URL that fresh scaffolds pin actually resolves. The scaffolder reads the
      host's current version, so do not hardcode one here.
- [x] Scaffold the plugin (`yarn create:plugin`) into `vc-module-sales-rep` (#13, `StorefrontApp/`), building into its
      `plugins/vc-frontend/` folder so the platform advertises it (#2). The scaffolder emits the
      `public/plugin.json` that declares `exposed: "./plugin"` — verify it lands in `dist/`, since
      the platform's default is `./Module`.
- [ ] **Plugin-repo CI guard:** fail the plugin build if the committed `@vc-frontend/core`
      value isn't the pinned release URL (catches a stray `file:`/`portal:`/yalc leak).
- [ ] **Route authorization** — sales-rep is rep-only; plugin `addRoute` has no
      permission/guard primitive in the facade yet. Likely a pilot blocker for real users.
      VCST-5761 covers the declarative half (`when: userCan(...)` on a declared route, evaluated
      before the placeholder is registered); what stays open here is a guard on a route the plugin
      registers itself. Partly addressed: the loader wraps the router for the whole load-and-init
      phase and refuses a plugin claim on a name the host owns (`router.addRoute` evicts a
      same-named root route, and vue-router's own warning is dev-only). It covers every name one
      call would claim — both `addRoute` overloads and each named entry in `children` — and
      `removeRoute` of a host name, so remove-then-add cannot launder a squat. That covers
      takeover, not authorization, and only inside the window: a claim made after the phase settles
      is unguarded.
- [x] [**VCST-5761** — declare plugin contributions so boot stops blocking and nothing shifts when
      a plugin lands](https://virtocommerce.atlassian.net/browse/VCST-5761) — #2504. It also absorbs,
      from this file: the route-fallback and boot-cost-∝-N items that used to sit in #6, the
      backstop's late-registration hole, and a switched-off plugin paying the whole load chain.
      What it leaves open:
  - [ ] **A switched-off plugin costs one request, not zero.** Contributions ride in `contentFiles`
        because vc-platform's `PluginManifestFile` binds six `plugin.json` fields and drops the rest
        (`AppManifestService.cs:450`). Zero needs the platform model, its descriptor hash and
        x-api's `StorePlugin` to carry `when` (at least) — then phase A reads it from `store.plugins`.
  - [ ] **The sales-rep plugin declares nothing yet** — its `plugin.config.ts` in
        vc-module-sales-rep#13, against facade `0.1.3`. Until then it keeps blocking boot.
  - [ ] **Reserved-box sizes** exist for `productCard/card-button` (measured: 0.0082 of CLS from
        the cards without a reservation, none with one) and for `block`; every other slot relies on
        the host fallback it hides, or has none and holds zero height. Size them as plugins start
        declaring them.
  - [ ] Global conditions are read once at boot; a sign-in mid-session does not re-declare
        (out of scope in the ticket, as for module `init()` today).
- [ ] [**VCST-5762** — extension-registry precedence: the host must win regardless of
      order](https://virtocommerce.atlassian.net/browse/VCST-5762). Changes a facade-exported
      signature, so it carries a contract rebuild.
- [ ] Facade additions the plugin turns out to need (→ #7 guard rails).

## 2. Runtime discovery — done, via the platform rather than a store setting

The platform shipped its own answer (x-api 3.1016.0 / x-frontend 3.1005.0): `AppManifestService`
advertises every installed module carrying `plugins/vc-frontend/`, xAPI projects that as
`store.plugins(appId:)`, and the loader consumes it. Installing a module now adds a plugin with no
host rebuild, and `APP_MODULES_FEDERATION_REMOTES` stayed the local override — the precedence this
section had already decided.

Dropped with it: the central `ModuleFederation.Remotes` store setting, its dedicated platform
module, and the versioned cross-source descriptor. Two sources remain (platform, env override), each
with its own resolver normalizing into `IRemoteDescriptor` — but there is no third shape to design
for.

Still open:

- [ ] **Freshness of the list** — our side is uncached, so a newly installed plugin appears on the
      next page load. What is left is platform-side: `AppManifestService` caches its manifest for
      the process lifetime.
- [x] **Theme master switch** — `module_federation_enabled` in `client-app/config/settings_data.json`
      is the only switch: `vite.federation.ts` gates the build, `enabled.ts` the runtime.
- [ ] **Backend-capability gate** — `requiredBackendModules` precondition checked against
      the installed module list before load; unmet ⇒ `skipped` with a distinct reason
      (decided in review: discovery-decoupling ≠ functional-decoupling).
- [ ] [**VCST-5760** — contain plugin CSS with native cascade
      layers](https://virtocommerce.atlassian.net/browse/VCST-5760) (sprint 26-17). Decision,
      measured regression surface and the rejected alternatives (Tailwind `prefix`, `@scope`,
      `<style scoped>` + `@apply`, the PR #2372 prototype that is not landing):
      [`specs/2026-08-21-plugin-css-cascade-layers.md`](./specs/2026-08-21-plugin-css-cascade-layers.md).
- [x] **Name-collision dedup** — the first descriptor to survive validation wins; a later plugin
      claiming the same name is reported in `skipped` under its own id, since the contested name
      belongs to the winner. Previously both were registered and both loaded, so one plugin's code
      never ran while still being reported as loaded. `{ force: true }` has since been dropped from
      `registerRemotes` — see below.

## 3. Artifact integrity for remote code

Remotes load over https from trusted hosting, but there is no integrity/signature check
on the manifest or chunks (MF has no native SRI story). This also covers the known
**TOCTOU** window: the gate fetches the manifest, then the MF runtime independently
fetches it again for loading — a redeploy between the two requests means validated ≠ executed,
plus a second round trip per remote.

- [ ] **Seed the validated manifest through the runtime's `fetch` loader hook.** Worth doing on its
      own, independent of integrity. `SnapshotHandler.getManifestJson` emits
      `loaderHook.lifecycle.fetch` before its own `fetch` and uses a returned `Response`, so an MF
      host plugin that replies with the body the gate already read makes validated bytes == executed
      bytes and removes the second round trip per remote. Earlier notes here claimed the cache was
      not seedable; that was wrong.

The 2026-07-06 review called this **a prerequisite for enabling runtime discovery in prod, not a
later hardening pass**, on the grounds that a store-editable setting plus a mutable origin is a
code-execution surface for whoever can edit the setting. Both halves of that premise are gone:
there is no editable setting (the source is module installation, already a code-execution
capability), and the origin is no longer mutable — it is checked, not assumed. What the premise
change does NOT cover:

- [x] Platform entries and stylesheets are checked for **same-origin** (`isSameOrigin`), so a
      descriptor cannot name a foreign host, and a platform entry must resolve to an **http(s)**
      URL after the manifest rewrite (a `blob:` URL shares this origin but has an opaque path, which
      makes the rewrite a no-op and would leave MF script-loading the entry as code).
      `isAllowedRemoteUrl`'s https rule covers the env override, where cross-origin is the point —
      and the manifest RESPONSE is re-checked against the rule of the source it came from, not
      against same-origin for both, which would have killed the env override outright.
- [x] **Remote names are validated** on both paths (`/^[A-Za-z0-9][A-Za-z0-9._-]*$/`). MF resolves a
      `loadRemote` id by prefix, so `a/plugin` could answer the request meant for `a` and serve its
      expose from the wrong bundle with both reported loaded; exact-name dedup cannot see it.
- [x] **Malformed descriptors cost one plugin, not the batch.** Every field is read through a string
      guard and the list is checked for arrayness — a non-string `permission` or `entry.type` used
      to throw out of the loader and lose every plugin, contradicting "isolation is total".
- [x] No integrity check on what actually executes — **reviewed, deliberately not done**. Writing
      the artifacts requires access to the backend that serves them, and from there an attacker
      returns hostile code on the *first* fetch; the TOCTOU window is a sub-case of a position
      already lost. Nor is it implementable host-side: MF loads `remoteEntry.js` through an
      injected `<script>`, so the executed bytes are never ours to hash, and `entry.hash`
      (`8DBA4F3C`) is a cache-buster, not an SRI digest. If plugins ever come from a host other
      than our own backend, revisit — immutable **versioned URLs** are then the cheapest form
      (they make both fetches return the same bytes, though the second fetch remains).

## 4. CSP at the vc-deploy ingress (prod prerequisite)

No security headers exist in the reference stack today; a **tight base CSP is a from-zero
project on the prod critical path** (GA4/Hotjar/inline scripts currently need
`unsafe-inline`-class allowances). Never a `vc-frontend` repo change. Analysis and
decisions (path-scoping, versioned-immutable URLs, drift validation): *Security guard*
section of the discovery spec.

- [ ] Introduce the CSP at the nginx ingress (per-env, git+PR): `configuration-snippet`
      annotation or controller custom-headers ConfigMap.
- [ ] **Path-scope** plugin origins. Platform plugins are same-origin, so their baseline is a plain
      `self`; path-scoping applies to the env-override/external-hosting case
      (e.g. `script-src https://cdn.jsdelivr.net/gh/VirtoCommerce/`). The discovery spec's
      *Security guard* section argued this for the abandoned external-CDN model — read it as history.
- [ ] Validate configured remote origins against the env CSP (two-control-plane drift);
      surface CSP-blocked loads as a **distinct, observable** loader outcome.
- [ ] Keep a build-time exact-URL allowlist as complementary defense-in-depth (CSP gates
      loading; it does not contain a loaded plugin).

## 5. Plugin-side story in CI

`yarn create:plugin` output is verified end to end (install, build, manifest metadata,
type-check — including from the real tarball), but only manually. Remaining:

- [ ] Wire the scaffold → install → build cycle into CI (locks the plugin contract).
- [ ] **Re-wire `validate:core-types` into `yarn validate` when MF ships.** It was
      removed from the aggregate `validate` script during the pilot (no plugin consumes
      the contract yet) so that unrelated PRs — e.g. a routine GraphQL-types regen, which
      reaches the contract through the facade's `apolloClient`/`graphqlClient`
      re-export — aren't blocked by contract drift. Once a plugin depends on the contract,
      add `&& yarn validate:core-types` back to the `validate` script in `package.json`.
- [ ] **Host PR CI: fetch the `dev` baseline** for `validate:core-types` (only matters
      once the check above is re-wired into CI) — the removal-detection gate
      (`compareContractToBase`) degrades to a loud warning when the checkout is too
      shallow to see the base branch's committed contract. Needs `fetch-depth: 0` (or an
      explicit `git fetch origin dev`) in the theme CI checkout.
- [ ] A live `loadRemote` smoke against a running host build.
- [x] `resolveRemotes` coverage for name collisions and for a valid-but-empty `{}` override, which
      now says so in the log instead of suppressing the platform list silently.
- [x] **Guard test for the load-bearing boot ordering** — `setThemeContext(store)` and
      `setUser(userResult)` must both run before `startFederatedModules()`; plugins resolve store
      settings through `useModuleSettings`, and the permission gate reads `user.value` at call
      time. `boot-order.test.ts` executes the real `app-runner` against mocked collaborators and
      asserts the order the calls actually happen in, so moving one into a callback or a branch
      fails too — not only moving its line.

## 6. Stage 2 — hardening & scale-out (not yet designed)

From the 2026-07-06 review. None of these block shipping the harness — it ships on by
default behind `module_federation_enabled`, loads only what installed modules advertise, and
fails closed and bounded. They become relevant when scaling past a controlled pilot (more plugins,
third-party authors, runtime discovery, broad store rollout); the kill switch and CSP are the
two to treat as prerequisites for *that* stage (artifact integrity is not — see #3). (Route
authorization moved to #1 — it likely blocks the pilot; boot cost ∝ N and route fallback moved to
VCST-5761.)

- **Inter-plugin isolation** — route-path collisions and extension-key clobbering between plugins
  are unhandled (only host-vs-plugin isolation exists). Duplicate remote names are handled — see #2.
- **Kill switch** — killing a bad plugin means uninstalling its module (or a host rebuild when it
  came from the env override); there is no per-plugin toggle. Gate prod exposure on CSP.
- **SSR/SEO** — `loadRemote` is client-side, so plugin routes are CSR-only (rules out MF for
  SEO-relevant public content; fine for authenticated sales-rep).
- **Plugin i18n** — no contract for a plugin to register translation messages / RTL.
- **Compat-drift governance** — no registry of plugin↔host versions / host-major breakage
  detection across N plugins.
- **Prod telemetry for failed/skipped plugins (AppInsights)** — the one deferred item still
  without a Jira id, and the one that makes the others invisible. An observability
  improvement, not a blocker: the harness fails closed and ships fine without it. `Logger`
  is a no-op in production, so a failed/skipped plugin leaves no prod signal today (dev gets
  console via Logger). Design sketch: expose the AppInsights instance to
  boot-time code via an `onLoaded`-fed module singleton + a `getAppInsightsWhenReady(timeout)`
  bridge in `applicationInsights.plugin.ts` (the library's `useAppInsights()` is inject-based;
  the loader starts before the plugin installs, so a bare read is always undefined), then
  report `failed` as `trackException` and `skipped` as a `[MF] federated plugin skipped`
  customEvent (split streams so gate-noise cannot drown real failures), fire-and-forget.
  Also report boot-backstop overruns (`bootstrap.ts`) — today an overrun leaves no prod
  signal at all, so sporadic missing-plugin incidents cannot be correlated to slow boots.
  Harden install() while at it: `app.use(AppInsightsPlugin)` in try/catch — `Logger.error` +
  a `useNotifications()` toast, settle the ready promise, keep booting (a malformed
  instrumentation key must not white-screen the store).
- **Contract-gate granularity** — breaking-change detection (`core-api/contract-versioning.mjs`)
  diffs top-level export *names* only: a signature/type change to an existing export ships as
  a minor bump, `^`-satisfies the contract gate, and a stale plugin loads against the changed
  surface anyway. Fix is structural API diffing (api-extractor / ts-morph over the two `.d.ts`
  programs) or requiring a human minor/major classification on any contract change.
- **Multi-store vs env granularity** — one env/backend serves many stores → per-store remote
  lists but a per-env ingress CSP that must allowlist the *union* of every store's origins.
- **Discovery depends on x-api ≥ 3.1016.0** — an older backend cannot answer `store.plugins`, so
  discovery fails closed to no-remotes. Its own query keeps that failure off the boot store query,
  and `SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT` keeps it off the user's screen — without that context
  the global handler broadcasts a generic error toast to every open tab.

## 7. Facade surface review (ongoing guard rails)

The current facade (`core-api/index.ts`) is intentionally minimal. As real plugins get
built, expect requests to widen it. Guard rails:

- Keep it **additive** — removing/renaming ⇒ breaking ⇒ `CORE_VERSION` bump.
- Every addition grows `contract/index.d.ts` and its transitive type graph — watch the size.
- Prefer exposing **composables/functions** over raw internals, so the implementation can
  change behind the facade without breaking the contract.
