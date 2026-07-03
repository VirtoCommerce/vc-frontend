# Federated Modules — TODO / deferred work

Tracking for **VCST-5159**. These are known follow-ups deliberately left out of the
initial harness to keep the first cut small and reviewable. Roughly in priority order.

---

## 1. Central remote discovery (drop the hardcoded list)

**Now:** remotes come from the `APP_MF_REMOTES` env var — a static JSON map baked in at
deploy time. Adding/removing a plugin means a redeploy.

**Want:** the host fetches a **central manifest** (e.g. from the platform backend) that
lists the enabled remotes for this tenant/environment, and registers those at runtime.
No host redeploy to enable a plugin.

- Prior art: vc-shell does this — backend endpoint `GET /api/apps/{appId}/manifest`
  (`AppManifestService.cs`), `remoteEntry` served as a static file from a platform module.
- Keep `APP_MF_REMOTES` as a **local/dev override** even after this lands.
- Decision on record: *"let it be constant yet"* — so this is explicitly deferred, not
  forgotten. `resolveRemotes()` in `index.ts` is the single seam to change.

---

## 2. CI guard for the generated type contract

`client-app/core-api/dist/index.d.ts` is generated (`yarn build:core-types`) and
**committed**. Nothing stops someone editing the facade and forgetting to regenerate,
so the committed `.d.ts` silently drifts from source.

**Want:** a CI step that runs `yarn build:core-types` and fails if `git diff` is dirty —
i.e. "the committed contract doesn't match the facade." Cheap, catches the whole class.

---

## 3. Production error routing

`reportOutcome()` logs failures and, **in DEV only**, shows a toast. In production,
failed/skipped plugins are logged but not surfaced anywhere actionable.

**Want:** route failed/skipped plugins to AppInsights (`trackException`) so a plugin that
silently vanishes in prod is observable. There's already a `// Prod:` marker in `index.ts`.

---

## 4. Confirm the plugin-side story end to end

The harness is host-side only and ships no built-in remote, so the plugin contract is
currently validated by design, not by a living example in CI.

**Want:** a minimal reference remote (separate build) that exposes `./plugin`, consumes
`@vc-frontend/core`, declares `requiredHostVersion`, and is loaded in an integration test.
Locks the contract against regressions and doubles as copy-paste starter docs.

---

## 5. Facade surface review

The current facade (`core-api/index.ts`) is intentionally minimal. As real plugins get
built, expect requests to widen it. Guard rails:

- Keep it **additive** — removing/renaming ⇒ breaking ⇒ `CORE_VERSION` bump.
- Every addition grows `dist/index.d.ts` and its transitive type graph — watch the size.
- Prefer exposing **composables/functions** over raw internals, so the implementation can
  change behind the facade without breaking the contract.

---

## Not doing (and why)

- **Runtime version *gating* beyond a warn** — MF's own `requiredVersion` only warns.
  Our explicit pre-execution gate (`isCompatible`) is the safety net; vc-shell dropped
  runtime version gating entirely (PR #228). We keep the fail-closed manifest check but
  don't try to out-clever MF's shared-scope negotiation.
- **Publishing `@vc-frontend/core` to npm** — the host is `"private": true` and deploys
  as a theme zip. Publish-from-source (portal link + committed `.d.ts`) is deliberate.
