# MF documentation and plugin tooling — plan

Status: **agreed, not started** (2026-10-13). Baseline: `dev` @ `8c788b038`.

## 1. Documents

| # | Document | Reader | Answers |
|---|---|---|---|
| 1 | General guide (`core/federation/README.md`) | anyone touching the host | how it works, what it guarantees, how to diagnose |
| 2 | Scenarios S1–S8 (entered via a decision tree) | plugin and host developers | "I want X — what do I do?" |
| 3 | Facade maintainer guide (`core-api/README.md`) | facade maintainers | what to expose, classify, release |
| 4 | Generated plugin README | plugin author | run, change, check, ship *this* plugin |

`HOWTO.md` content is migrated into 1, 2 and 4, then reduced to a pointer.

### 1.1. Scenarios

- **S1a** — plugin in an existing backend module
- **S1b** — new backend module from scratch (module creation itself: link to VC backend docs)
- **S2** — change a plugin, the facade has everything
- **S3** — change a plugin, the facade must grow (host PR → facade release → plugin bump; yalc meanwhile)
- **S4** — upgrade a plugin to a new host/facade
- **S5** — move an in-repo module into a plugin
- **S6** — enable a plugin on an environment
- **S7** — a plugin is missing or broken
- **S8** — add a new extension point to the host. Describes the *principle*, not only slots and menus:
  routes, menus, registry places (replace / contribute), cross-cutting registries
  (`registerLocaleLoader`, `registerCacheTypePolicies`), and when a declarative contribution type is needed.

Each scenario: when it applies → prerequisites → numbered steps (with the directory) → success check → at most three pitfalls → links.

### 1.2. Stability rules

1. Docs hold what is stable: the model, contracts, invariants, decisions, limits.
2. Docs link to what changes: export lists, versions, timeouts, flags, scripts.
3. Reference code by file + symbol, never by line.
4. Every invariant names the test that holds it.
5. Mark every claim **implemented**, **verified (how, when)** or **not verified**.
6. Header: commit, facade version, date, verification scope.

## 2. AI layer

Claude Code skills, one per scenario (`mf-*`), go to `VirtoCommerce/ai-tools` →
`plugins/vc-frontend/skills/` **in a separate PR**. Skills link to these docs and to code. They never
copy facts. Human docs stay complete enough to review what an agent did.

## 3. Generator, skill, check — who does what

| Role | Owns | Rule |
|---|---|---|
| **Generator** (`yarn create:plugin`) | files that are identical everywhere and belong to us | creates **new** files only; never edits an existing file; refuses to overwrite |
| **Skill** (ai-tools) | edits to files that differ per module | reads the file, adapts, shows the diff; ends by running the check |
| **Check** (`yarn check:plugin-module`) | deterministic verdict | same ✅/❌ for a human, a skill or CI |

People without the skill: the generator prints the manual steps, the docs carry the same list, and the
same check confirms the result.

### 3.1. Generator: `--module <path-to-*.Web>`

Creates:
- `StorefrontApp/` with `build.outDir: "../plugins/vc-frontend"`;
- `StorefrontApp/storefront-plugin.targets`, holding the `StorefrontApp\**` exclusions, `BuildStorefrontPlugin`
  (corepack → `yarn install --immutable` → `type-check` → `build`) and `PublishStorefrontPlugin`
  (copy to `$(PublishDir)\..\plugins`, not `bin/`), plus `SkipStorefrontPlugin`;
- the codegen alias workaround while the host pins `@module-federation/vite` < 1.23.1.

Prints the manual steps from 3.2.

**Not verified:** that `Remove` items in an imported `.targets` take effect in an SDK-style project.
Prove this with a build before the docs promise it.

### 3.2. Skill: edits to existing files

1. `.csproj`: one `<Import Project="StorefrontApp\storefront-plugin.targets" />`.
2. `module.manifest`: `VirtoCommerce.XFrontend` dependency (for install order, not discovery), plus
   platform/x-api floors when `contributions` are used.
3. `.gitignore`: `/src/<Module>.Web/plugins/`.
4. CI: Node present, corepack enabled.

### 3.3. Check: `check:plugin-module <path> [--artifact <zip>] [--env <url>]`

- files: everything in 3.1–3.2, `plugin.json` expose `./plugin`, `requiredHostVersion` matches the facade pin;
- `--artifact`: `plugins/vc-frontend/` sits at the zip root, not under `bin/`;
- `--env`: `store.plugins` lists the plugin, and `/modules/<id>/plugins/vc-frontend/mf-manifest.json` answers 200.

### 3.4. Single source for backend floors

`BACKEND_REQUIREMENTS` in `core-api` (platform, x-api, x-frontend minimums). The generator, the check and the
skill read it. The docs name the constant, never its values.

## 4. Order

1. Tooling: generator `--module`, `BACKEND_REQUIREMENTS`, `check:plugin-module` (own ticket and PR).
2. Docs 1–4 against the tooling (an accuracy audit of the existing docs on the way).
3. Skills in ai-tools (separate PR).

## 5. Before publishing

- Run scaffold → build → load in the host end to end. Scaffold tests skip install and build.
- Verify HMR across projects.
- Verify module packaging on a real artifact and environment.

## 6. Known errors in current docs (fix during the rewrite)

- `HOWTO.md`: "the XFrontend dependency makes the platform probe the module". It doesn't: every installed module is probed.
- `README.md`: "manifest reuse not implemented". `installManifestReuse()` implements it.
- `TODO.md`: versioning watches only the contract and preset. It also watches published sources and package metadata.
- `vc-module-sales-rep` `StorefrontApp/README.md`: old path `modules/federated`, retired `APP_MODULES_FEDERATION_ENABLED`, `^1.1.0`.
