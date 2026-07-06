# Facade distribution — harness side (VCST-5159)

**Status:** implemented (see the Addendum for what shifted during implementation)
**Branch / PR:** `feat/VCST-5159-mf-harness` (same PR as the harness)
**Decision record:** [`2026-07-06-discovery-hosting-decision.md`](./2026-07-06-discovery-hosting-decision.md)
→ *Facade distribution & local co-dev* (the *why*; this spec is the *what/how* for the
harness-side slice).

## Goal

Make `@vc-frontend/core` consumable by out-of-repo Module Federation plugins with **no
registry, token, account, or secret**, per the decided mechanism:

- **Committed / CI form:** a pinned, versioned tarball URL — a GitHub Release asset
  `vc-frontend-core-<CORE_VERSION>.tgz` on tag `core-v<CORE_VERSION>` of this public repo.
- **Local co-dev form:** yalc (offline, copies real files, no symlink duplicate-instance
  footgun).

Scope is **this repo only**: packability, the release workflow, the scaffolder default,
co-dev convenience, docs. The sales-rep plugin repo, settings-driven discovery, CSP, and
any plugin-repo CI checks are out of scope (tracked in TODO.md).

## Changes

### 1. `client-app/core-api/package.json` — packable

Add a `files` field so `npm pack` carries only the distributables:

```jsonc
"files": ["dist/index.d.ts", "federation.mjs", "federation.d.mts", "tailwind-preset.cjs"]
```

- `package.json` is included automatically; the existing `exports` map already routes
  `.` / `./federation` / `./tailwind-preset`, so the tarball install needs nothing else.
- `"private": true` stays — it blocks `npm publish`, not `npm pack`.
- No change to the host's own `"@vc-frontend/core": "portal:./client-app/core-api"`
  self-link in the root `package.json` — that is host-internal build resolution, not
  plugin distribution.

### 2. New workflow — `.github/workflows/core-facade-release.yml`

**Trigger: manual `workflow_dispatch`, no inputs** (the version is single-sourced from
`core-api/package.json`; there is nothing for a human to type). Steps:

1. Checkout + install + `yarn build:core-types` — regenerating the contract fails on
   drift, so a stale committed contract cannot be released.
2. **Immutability guard:** read `CORE_VERSION` from `client-app/core-api/package.json`;
   if tag `core-v<CORE_VERSION>` already exists, **fail** with the message "release
   exists — bump the contract version instead of re-releasing".
3. `cd client-app/core-api && npm pack` → `vc-frontend-core-<CORE_VERSION>.tgz`.
4. `gh release create core-v<CORE_VERSION> <tgz> --title "@vc-frontend/core <CORE_VERSION>" --notes <short blurb + link to core-api/README>`
   using the built-in `GITHUB_TOKEN`; job `permissions: contents: write`. No stored secret.

Consumption URL shape (what plugins pin):

```
https://github.com/VirtoCommerce/vc-frontend/releases/download/core-v<V>/vc-frontend-core-<V>.tgz
```

`yarn.lock` in the consuming plugin records the tarball checksum → tamper-evident pin.

### 3. `client-app/core-api/create-plugin.mjs` — tarball dep replaces `portal:`

- The generated dependency becomes the pinned URL computed from the host checkout's
  current `CORE_VERSION` (read from `core-api/package.json`, already loaded as `corePkg`):

  ```jsonc
  "@vc-frontend/core": "https://github.com/VirtoCommerce/vc-frontend/releases/download/core-v1.0.0/vc-frontend-core-1.0.0.tgz"
  ```

- Repo slug `VirtoCommerce/vc-frontend` is a hardcoded constant in the script (the
  scaffolder ships only in this repo; no `repository` field exists in the root
  `package.json` to read).
- Remove `portal:`-specific code: the `portalPath` computation and the
  `packageManager` line + its Berry-requirement comment (the `portal:` protocol needed
  Berry; a tarball URL works on any package manager — that neutrality is the point).
- Keep the generated `.yarnrc.yml` (`nodeLinker: node-modules`) — still sane for a
  standalone project.
- Generated plugin `.gitignore` gains `.yalc/` and `yalc.lock` (yalc artifacts appear in
  the **consumer** project).
- Scaffold completion message gains a note: if `core-v<V>` has not been published yet,
  `yarn install` will 404 — either run the *Core facade release* workflow once, or use
  `yalc add @vc-frontend/core` for purely local work.
- Generated plugin README mentions the pinned-URL rule (never commit a `file:`/`link:`
  yalc dep; restore the release URL before pushing).

### 4. yalc co-dev convenience (host side)

- One root `package.json` script:

  ```jsonc
  "core:yalc-push": "yarn build:core-types && cd client-app/core-api && yalc push --private"
  ```

  Rebuild the contract and propagate to every locally-linked plugin in one command.
  (`yalc push` publishes to the local `~/.yalc` store *and* updates all consumers that
  ran `yalc add`/`yalc link`. `--private` is required because the facade package is
  `"private": true` — yalc refuses to publish a private package without it.)
- yalc is **not** added as a host devDependency — it is a dev-machine tool
  (`npm i -g yalc`), not part of the host build; the docs say so. The script failing
  with "yalc: command not found" is acceptable and self-explanatory.
- The host repo itself needs **no** `.gitignore` entries (yalc artifacts land in
  consumer projects, not the published package's repo).

### 5. Docs

- **`client-app/modules/federated/HOWTO.md`**
  - Step 1: dependency example switches `portal:` → the pinned tarball URL, with a
    sentence on what it is (a Release asset of the public host repo; checksum recorded
    in the plugin's lockfile; no token).
  - New short subsection "Co-developing the facade and a plugin" — the yalc loop
    (`yalc publish --private` → `yalc add` → edit → `yarn core:yalc-push`), plus hygiene: never
    commit the injected `file:.yalc/…` dep; `yalc remove` + restore the pinned URL
    before pushing.
  - Versioning cheat sheet: add a row for "consume a new facade version" (bump the
    pinned URL + `requiredHostVersion` together).
- **`client-app/core-api/README.md`**
  - "Why publish-from-source instead of npm?" — correct the stale rationale (the repo is
    public; `private: true` only blocks `npm publish`) to match TODO.md, and describe
    the actual distribution: committed `.d.ts` for the contract in-repo, tarball Release
    asset (manual workflow) for out-of-repo consumption, yalc for co-dev.
  - Files table: no change needed (workflow lives under `.github/`).
- **`client-app/modules/federated/README.md`** — no `portal:` references found; verify
  during implementation and touch only if something contradicts the above.
- **`client-app/modules/federated/TODO.md`** — in §1 *Facade distribution & local
  co-dev*: mark the implementation-details items delivered by this PR, and record the
  trigger decision as **manual `workflow_dispatch`** (the text currently sketches
  "on release/tag").

## Error handling

- **Release workflow:** fails closed on contract drift (step 1) and on re-release of an
  existing version (step 2). A failed `gh release create` (e.g. tag created moments
  earlier by a concurrent run) surfaces as a job failure — acceptable for a manual,
  low-frequency action.
- **Scaffolded plugin before first release:** `yarn install` 404s on the pinned URL —
  mitigated by the scaffolder's completion note (run the workflow once, or yalc).
- **yalc dep leaking into a commit:** guarded by generated `.gitignore` + README rule;
  the CI-side hard check lives in the plugin repo (out of scope here, noted in TODO).

## Testing

- `npm pack --dry-run` in `core-api` → file list is exactly the four distributables +
  `package.json`.
- Scaffolder e2e (as previously verified, re-run): `yarn create:plugin test-plugin <tmp>
  --yes` → generated `package.json` contains the pinned URL, no `portal:`, no
  `packageManager`; `.gitignore` contains yalc entries.
- Workflow: `actionlint` if available, else careful review — it is dispatch-only, so a
  YAML mistake cannot fire on merge.
- Existing `yarn validate` must stay green (the `files` field must not confuse
  `validate:core-types`).

## Addendum (discovered during implementation)

- **Tailwind preset had to become a generated artifact.** Installing the real tarball
  revealed `tailwind-preset.cjs` re-exported `../../tailwind.config` — resolvable via
  `portal:`/yalc only, broken in a tarball. Implemented: `build-types.mjs` now also
  generates a self-contained `dist/tailwind-preset.cjs` (theme data inlined via
  `tailwindcss/loadConfig`; `content` omitted; the config's Tailwind plugins re-emitted
  as consumer-resolved `require`s, added to the scaffold's `--with-tailwind` deps).
  Drift-checked by `validate:core-types`; a preset change auto-bumps `CORE_VERSION`
  (minor) exactly like a contract change, because the released tarball is immutable per
  version. The `files`/`exports` entries moved to `dist/tailwind-preset.cjs`.
- **Drift check correction:** the release workflow runs `yarn validate:core-types`
  (read-only `--check`), not `build:core-types` — the build variant regenerates and can
  auto-bump, and a release must pack exactly what is committed.
- **Repo slug:** `VirtoCommerce/vc-frontend` (the repo is being renamed;
  `vc-theme-b2b-vue` is the legacy alias).

## Out of scope (recorded, not lost)

Sales-rep plugin repo scaffold/hosting; settings-driven discovery; CSP work; plugin-repo
CI check for the pinned-URL rule; npm registry publishing (explicitly "not doing" per
TODO.md).
