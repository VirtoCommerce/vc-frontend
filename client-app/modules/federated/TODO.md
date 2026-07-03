# Federated Modules — TODO / deferred work

Tracking for **VCST-5159**. These are known follow-ups deliberately left out of the
initial harness to keep the first cut small and reviewable. Roughly in priority order.

---

## 1. Central remote discovery (drop the hardcoded list)

**Now:** remotes come from the `APP_MF_REMOTES` env var — a static JSON map **inlined at
build time**. Adding/removing a plugin means rebuilding the host.

**Want:** the host fetches a **central manifest** (e.g. from the platform backend) that
lists the enabled remotes for this tenant/environment, and registers those at runtime.
No host rebuild to enable a plugin.

- Prior art: vc-shell does this — backend endpoint `GET /api/apps/{appId}/manifest`
  (`AppManifestService.cs`), `remoteEntry` served as a static file from a platform module.
- **Must ship together with an origin allowlist**: once the remote list becomes runtime
  data, "who can add a remote" becomes a code-execution trust boundary (today the
  build-time inlining is what keeps it deploy-controlled — see the README security model).
- Keep `APP_MF_REMOTES` as a **local/dev override** even after this lands.
- Decision on record: _"let it be constant yet"_ — so this is explicitly deferred, not
  forgotten. `resolveRemotes()` in `index.ts` is the single seam to change.

---

## 2. Artifact integrity for remote code

Remotes load over https from trusted hosting, but there is no integrity/signature check
on the manifest or chunks (MF has no native SRI story). This also covers the known
**TOCTOU** window: the gate fetches the manifest, then the MF runtime independently
fetches it again for loading (its cache is not publicly seedable) — a redeploy between
the two requests means validated ≠ executed, plus a second round trip per remote.
Evaluate: signed manifests, hash pinning in the central discovery response (vc-shell
passes `entry.hash`), or CSP `strict-dynamic` + nonce approaches.

---

## 3. Confirm the plugin-side story end to end

The harness is host-side only and ships no built-in remote, so the plugin contract is
exercised by unit tests (loader/gate/shared-config) but not by a living remote in CI.

**Want:** a minimal reference remote (separate build) that exposes `./plugin`, consumes
`@vc-frontend/core` + `REMOTE_SHARED`, declares `requiredHostVersion`, and is loaded in
an integration test. Locks the contract against regressions.

Partially covered already: `yarn create:plugin` generates exactly such a remote and has
been verified end to end (install, build, manifest metadata, type-check). The remaining
gap is wiring that generate-and-build cycle into CI, plus a live `loadRemote` smoke
against a running host.

---

## 4. Facade surface review

The current facade (`core-api/index.ts`) is intentionally minimal. As real plugins get
built, expect requests to widen it. Guard rails:

- Keep it **additive** — removing/renaming ⇒ breaking ⇒ `CORE_VERSION` bump.
- Every addition grows `dist/index.d.ts` and its transitive type graph — watch the size.
- Prefer exposing **composables/functions** over raw internals, so the implementation can
  change behind the facade without breaking the contract.

---

## Done (formerly deferred here)

- **Production error routing** — failed/skipped plugins are reported to Application
  Insights (`trackException` with plugin name, outcome and host core version) via the
  instance captured by `applicationInsights.plugin.ts`; best-effort no-op where
  AppInsights is not configured. DEV additionally shows a toast.

- **CI guard for the generated type contract** — `yarn validate:core-types` (part of
  `yarn validate`, which CI's `yarn build` runs) regenerates the contract and fails on
  drift; also checks `CORE_VERSION` ↔ `core-api/package.json` sync and that
  `federation.mjs` shared ranges stay compatible with host `package.json`.
- **Semver version gate** — `requiredHostVersion` accepts a version or range, evaluated
  with real semver, fail-closed on anything unparseable (was: custom dotted-numeric
  minimum-only compare).
- **Time budgets** — manifest fetch and plugin load/init are bounded so a hung remote
  degrades instead of blocking boot.
- **Shared-dep single source of truth** — `core-api/federation.mjs` (`HOST_SHARED` /
  `REMOTE_SHARED`), consumable by plugin builds as `@vc-frontend/core/federation`.

## Not doing (and why)

- **Out-clevering MF's shared-scope negotiation** — the shared singletons carry real
  semver ranges with `strictVersion: true`, so MF itself **throws** on a mismatch at
  `loadRemote()` (isolated per plugin by the loader), and the pre-execution manifest
  gate stays the outer fail-closed layer. We don't re-implement MF's negotiation on
  top; vc-shell dropped runtime version gating entirely (PR #228), we keep both layers.
- **Publishing `@vc-frontend/core` to npm** — the host is `"private": true` and deploys
  as a theme zip. Publish-from-source (portal link + committed `.d.ts`) is deliberate.
