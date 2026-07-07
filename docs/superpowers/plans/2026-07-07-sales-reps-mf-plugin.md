# My Sales Reps (VCST-5409) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a "My Sales Reps" contact table to organization members via a standalone Module Federation plugin, plus the minimal host-facade + scaffold-tooling changes it needs.

**Architecture:** Two work streams. **Host** (`vc-theme-b2b-vue`, branch `feat/VCST-5409-sales-reps` off `feat/VCST-5159-mf-harness`): add two facade exports — a narrow `extendMenuSchema` menu-injection helper and typed UI components (`VcTable`/`VcInput`/`VcEmptyView`) — and enrich the `create:plugin` scaffold with lint/format/git-hook tooling. **Plugin** (`~/vc/vc-plugins/sales-rep-plugin`, own git repo): scaffolded from the host, boots via the MF loader's `init()` to register a `/company/sales-reps` route + a Corporate nav link, and renders a read-only searchable table over mocked data. Local co-dev links the two with yalc.

**Tech Stack:** Vue 3 + TypeScript, Vite, `@module-federation/vite`, vue-router, vue-i18n, Tailwind (host preset), Vitest (plugin unit tests), the host's `@vc-frontend/core` facade.

## Global Constraints

- **Host branch:** `feat/VCST-5409-sales-reps`, already created off `feat/VCST-5159-mf-harness`. All host commits land here.
- **Facade is additive only.** Never rename/remove an existing export. After any `client-app/core-api/index.ts` change, run `yarn build:core-types` and commit the regenerated `contract/index.d.ts` + `contract/tailwind-preset.cjs` + bumped `client-app/core-api/package.json` **together** — CI fails on a stale/again-changed contract.
- **Plugin imports host code only from `@vc-frontend/core`** — never `@/…` paths.
- **Facade type-peers:** the scaffold must install `utility-types ^3.11.0` and `maska ^3.2.0` as devDeps (external contract imports behind `DeepPartial<MenuType>` and `VcInput`), else those facade types silently become `any` under `skipLibCheck`.
- **Gate is a plugin-local mock** (`isSalesRepsEnabled()` returns `true`), NOT the host `useModuleSettings().isEnabled()` (which is strict `value === true` and would disable the plugin with the backend module absent). The real `getSettingValue(ROLE_NAME_KEY)` call is written as a commented swap point.
- **`init()` must be idempotent** — the MF loader re-invokes on HMR; `extendMenuSchema` concatenates arrays and `addRoute` re-adds, so guard with a module-level `registered` flag.
- **Mobile nav ordering:** desktop corporate items have no `priority` (sort key 0, any positive works); **mobile** Company members has `priority: 30`, so the Sales Rep link needs `priority > 30` to sort after it on mobile.
- **Locale merge** must cover the current locale AND the `en` fallback, or missing keys render raw.
- **Read-only:** no row actions, no CRUD (AC#7). Only active reps shown (AC#5).
- **Kebab-case plugin name** `sales-rep` (becomes the MF remote name).
- Spec: `docs/superpowers/specs/2026-07-07-sales-reps-mf-plugin-design.md`.

---

## File Structure

**Host (`vc-theme-b2b-vue`):**
- Create `client-app/core/composables/extendMenuSchema.ts` — narrow menu-injection wrapper.
- Create `client-app/core/composables/extendMenuSchema.test.ts` — behavioral test.
- Modify `client-app/core-api/index.ts` — add facade exports (UI components + `extendMenuSchema`).
- Regenerate `client-app/core-api/contract/index.d.ts`, `contract/tailwind-preset.cjs`, bump `core-api/package.json` (via `yarn build:core-types`).
- Modify `client-app/core-api/create-plugin.mjs` — emit lint/format/git-hook configs + `--no-lint`, add type-peers `utility-types`/`maska`.
- Modify `client-app/modules/federated/create-plugin.test.ts` — assert new scaffold files.

**Plugin (`~/vc/vc-plugins/sales-rep-plugin`):** scaffolded, then:
- `src/constants.ts` — MODULE_ID, ROLE_NAME_KEY, route name/segment, page size.
- `src/types/index.ts` — `SalesRep`, `SalesRepSortColumn`, `SalesRepSort`.
- `src/api/mock.ts` — `MOCK_SALES_REPS` (active + inactive rows).
- `src/composables/useSalesReps.ts` — `selectSalesReps` pure helper + `useSalesReps` composable.
- `src/composables/useSalesReps.test.ts` — unit tests for active-only/search/sort/pagination.
- `src/composables/useSalesRepsConfig.ts` — `isSalesRepsEnabled()` + `salesRepRoleName()` (mock).
- `src/pages/sales-reps.vue` — the table page.
- `src/locales/en.json` (+ copies for other locales).
- `src/menu.ts` — corporate menu schema fragment.
- `src/routes.ts` — the `RouteRecordRaw`.
- `src/index.ts` — `init()` (idempotent gate → addRoute + extendMenuSchema + locale).
- `src/index.test.ts` — idempotency + gate test (facade mocked).
- Delete generated `src/pages/my-page.vue` (replaced).

---

## PHASE A — Host repo

### Task 1 (A1): Facade — `extendMenuSchema` helper + typed UI components

**Files:**
- Create: `client-app/core/composables/extendMenuSchema.ts`
- Create (test): `client-app/core/composables/extendMenuSchema.test.ts`
- Modify: `client-app/core-api/index.ts`
- Regenerate: `client-app/core-api/contract/index.d.ts`, `client-app/core-api/contract/tailwind-preset.cjs`, `client-app/core-api/package.json`

**Interfaces:**
- Produces: `extendMenuSchema(schema: DeepPartial<MenuType>): void` and facade exports `VcTable`, `VcInput`, `VcEmptyView` (consumed by the plugin in Phase B via `@vc-frontend/core`).

- [ ] **Step 1: Write the failing test**

```ts
// client-app/core/composables/extendMenuSchema.test.ts
import { describe, expect, it } from "vitest";
import { extendMenuSchema } from "@/core/composables/extendMenuSchema";
import { useNavigations } from "@/core/composables/useNavigations";

describe("extendMenuSchema", () => {
  it("appends a child to the desktop corporate section (via the live useNavigations singleton)", () => {
    extendMenuSchema({
      header: { desktop: { corporate: { children: [{ id: "spec-link", route: { name: "SpecRoute" } }] } } },
    });

    const corporate = useNavigations().desktopCorporateMenuItems.value;
    expect(corporate?.children?.some((c) => c.id === "spec-link")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run client-app/core/composables/extendMenuSchema.test.ts`
Expected: FAIL — `Failed to resolve import "@/core/composables/extendMenuSchema"` (file does not exist yet).

- [ ] **Step 3: Create the wrapper**

```ts
// client-app/core/composables/extendMenuSchema.ts
import { useNavigations } from "@/core/composables/useNavigations";
import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";

/**
 * Narrow facade helper for Module Federation plugins: contribute additional menu items
 * (e.g. an account-nav link) without exposing the whole useNavigations surface.
 * Same live singleton — the host provides this module at runtime via the MF shared scope.
 */
export function extendMenuSchema(schema: DeepPartial<MenuType>): void {
  useNavigations().mergeMenuSchema(schema);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn vitest run client-app/core/composables/extendMenuSchema.test.ts`
Expected: PASS.

- [ ] **Step 5: Add the facade exports**

Edit `client-app/core-api/index.ts`. Change the UI-kit line and add the helper export:

```ts
// UI kit — curated components for explicit imports (all VC* are also globally
// registered by the host, so plugins can use them in templates without importing).
export { VcWidget, VcTable, VcInput, VcEmptyView } from "@/ui-kit/components";
export { VcButton } from "@/ui-kit/components/molecules";
export { VcMarkdownRender } from "@/ui-kit/components/atoms";
```

and, after the `useModuleSettings` export line:

```ts
export { extendMenuSchema } from "@/core/composables/extendMenuSchema";
```

- [ ] **Step 6: Regenerate the contract**

Run: `yarn build:core-types`
Expected: ends with `wrote …/contract/index.d.ts (1764 lines)` and `external peer imports: … maska, utility-types, …`. No `@/…`-survival error. `git status` now shows modified `contract/index.d.ts`, `contract/tailwind-preset.cjs`, and (auto-minor-bumped) `core-api/package.json`.

- [ ] **Step 7: Run the full facade validation + the test again**

Run: `yarn vitest run client-app/core/composables/extendMenuSchema.test.ts && yarn validate:core-types`
Expected: test PASS; `validate:core-types` reports no drift (regenerates in memory and matches the committed file).

- [ ] **Step 8: Commit**

```bash
git add client-app/core/composables/extendMenuSchema.ts \
        client-app/core/composables/extendMenuSchema.test.ts \
        client-app/core-api/index.ts \
        client-app/core-api/contract/ \
        client-app/core-api/package.json
git commit -m "feat(VCST-5409): facade — extendMenuSchema helper + VcTable/VcInput/VcEmptyView"
```

---

### Task 2 (A2): `create:plugin` scaffold — lint/format/git-hook tooling + type-peers

**Files:**
- Modify: `client-app/core-api/create-plugin.mjs`
- Modify: `client-app/modules/federated/create-plugin.test.ts`

**Interfaces:**
- Consumes: nothing from A1.
- Produces: scaffolded plugins now contain `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.editorconfig`, `.vscode/settings.json`, `.commitlintrc.cjs`, `.husky/pre-commit`, `.husky/commit-msg`; `package.json` gains `lint`/`format`/`prepare` scripts, lint/husky devDeps, and type-peers `utility-types`+`maska`; a `--no-lint` flag skips all of it.

- [ ] **Step 1: Read the current generator once**

Run: `sed -n '145,225p' client-app/core-api/create-plugin.mjs`
Purpose: confirm where `toolDeps`, `pkgJson.scripts`, `pkgJson.devDependencies`, and the `writeFileSync` block are, so the edits below land in the right places. (`typePeerNames` is derived from `MF_SHARED_RANGES`; `utility-types`/`maska` are NOT in it, so they must be added explicitly.)

- [ ] **Step 2: Add the `--no-lint` flag to the known-flags set**

In `create-plugin.mjs`, find the usage string (around line 43) and `KNOWN_FLAGS` (around line 117). Add `--no-lint`:

```js
// usage line — add --no-lint to the printed options
"Usage: yarn create:plugin <plugin-name> <target-dir> [--yes] [--with-i18n] [--with-apollo] [--with-vueuse] [--with-tailwind] [--no-router] [--no-lint]",
```
```js
// KNOWN_FLAGS
const KNOWN_FLAGS = new Set(["--yes", "--no-lint", ...GROUPS.map((group) => group.flag)]);
```
And compute the toggle once, near `const selected = await selectGroups();`:
```js
const withLint = !flags.has("--no-lint");
```

- [ ] **Step 3: Add lint devDeps + type-peers + scripts**

After the `toolDeps` block (the `if (selected.tailwind) { … }`), add:

```js
// Type-peers the facade contract references but that are NOT MF shared singletons
// (types-only). Without them, DeepPartial<MenuType> (extendMenuSchema) and VcInput's
// mask types silently resolve to `any` under skipLibCheck.
const typeOnlyPeers = ["utility-types", "maska"];

// Lint / format / git-hook tooling — a trimmed, host-aligned subset. Opt out with --no-lint.
const lintDeps = withLint
  ? [
      "eslint",
      "typescript-eslint",
      "@vue/eslint-config-typescript",
      "eslint-plugin-vue",
      "eslint-plugin-prettier",
      "eslint-config-prettier",
      "globals",
      "prettier",
      "husky",
      "lint-staged",
      "@commitlint/cli",
      "@commitlint/config-conventional",
    ]
  : [];
```

Extend the `pkgJson` object: merge the new dep groups and add scripts. Replace the `scripts` and `devDependencies` fields:

```js
scripts: {
  build: "vite build",
  watch: "vite build --watch",
  preview: "vite preview --port 3001",
  dev: "vite --port 3001",
  "type-check": "vue-tsc --noEmit",
  ...(withLint
    ? {
        lint: "eslint . --fix",
        format: 'prettier --write "src/**/*.{ts,vue,json,css}"',
        prepare: "husky",
      }
    : {}),
},
dependencies: { "@vc-frontend/core": coreTarballUrl },
devDependencies: mergeDeps(
  sortedEntries(runtimeDeps),
  sortedEntries(toolDeps),
  sortedEntries(typePeerNames),
  sortedEntries(typeOnlyPeers),
  sortedEntries(lintDeps),
),
```

(Note: `sortedEntries` calls `hostVersion(name)`, which hard-exits if a package is absent from the host `package.json`. All names above are present today — eslint `^9.39.4`, typescript-eslint `8.62.1`, `@vue/eslint-config-typescript ^14.9.0`, eslint-plugin-vue `^10.9.2`, eslint-plugin-prettier `^5.5.6`, eslint-config-prettier `^10.1.8`, globals `^16.5.0`, prettier `^3.9.4`, husky `^9.1.7`, lint-staged `^16.4.0`, `@commitlint/cli`+`config-conventional ^20.5.3`, utility-types `^3.11.0`, maska `^3.2.0`.)

- [ ] **Step 4: Add the config-file templates**

Before the `// ── write ─` block, add these template constants:

```js
const eslintConfig = `import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import prettier from "eslint-plugin-prettier/recommended";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

// Trimmed, host-aligned flat config for a standalone MF plugin.
export default defineConfigWithVueTs(
  { ignores: ["dist/", "node_modules/", ".yalc/"] },
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  { languageOptions: { globals: { ...globals.browser } } },
  prettier,
);
`;

const prettierrc = JSON.stringify({ $schema: "https://json.schemastore.org/prettierrc", endOfLine: "auto" }, null, 2) + "\\n";
const prettierignore = "dist/\\nnode_modules/\\n.yalc/\\n";
const editorconfig = `# Editor configuration, see https://editorconfig.org
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
max_line_length = 120
trim_trailing_whitespace = true

[*.{vue,js,ts}]
quote_type = double

[*.md]
max_line_length = off
trim_trailing_whitespace = false
`;
const vscodeSettings = JSON.stringify(
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
    "eslint.useFlatConfig": true,
  },
  null,
  2,
) + "\\n";
const commitlintConfig = 'module.exports = { extends: ["@commitlint/config-conventional"] };\\n';
const huskyPreCommit = "yarn lint-staged\\n";
const huskyCommitMsg = "yarn commitlint --edit \\$1\\n";
```

Add a lint-staged field to `pkgJson` (only when `withLint`) — insert after the `scripts` block build of `pkgJson` by adding this immediately after the `pkgJson` object literal:

```js
if (withLint) {
  pkgJson["lint-staged"] = {
    "*.{js,ts,vue}": ["eslint --fix"],
    "*.{json,css}": ["prettier --write"],
  };
}
```

- [ ] **Step 5: Write the config files (guarded by `withLint`)**

In the `// ── write ─` block, after the existing `.yarnrc.yml` write, add:

```js
if (withLint) {
  writeFileSync(join(targetDir, "eslint.config.js"), eslintConfig);
  writeFileSync(join(targetDir, ".prettierrc.json"), prettierrc);
  writeFileSync(join(targetDir, ".prettierignore"), prettierignore);
  writeFileSync(join(targetDir, ".editorconfig"), editorconfig);
  writeFileSync(join(targetDir, ".commitlintrc.cjs"), commitlintConfig);
  mkdirSync(join(targetDir, ".vscode"), { recursive: true });
  writeFileSync(join(targetDir, ".vscode", "settings.json"), vscodeSettings);
  mkdirSync(join(targetDir, ".husky"), { recursive: true });
  writeFileSync(join(targetDir, ".husky", "pre-commit"), huskyPreCommit);
  writeFileSync(join(targetDir, ".husky", "commit-msg"), huskyCommitMsg);
}
```

- [ ] **Step 6: Extend the scaffold test**

Open `client-app/modules/federated/create-plugin.test.ts`. It spawns the real generator into a temp dir and asserts files exist/parse. Add a case asserting the lint files are emitted by default and skipped with `--no-lint`. Match the file's existing spawn helper and assertion style; the new assertions are:

```ts
// with default flags → lint tooling present
expect(existsSync(join(dir, "eslint.config.js"))).toBe(true);
expect(existsSync(join(dir, ".prettierrc.json"))).toBe(true);
expect(existsSync(join(dir, ".editorconfig"))).toBe(true);
expect(existsSync(join(dir, ".vscode/settings.json"))).toBe(true);
expect(existsSync(join(dir, ".husky/pre-commit"))).toBe(true);
const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
expect(pkg.devDependencies).toHaveProperty("eslint");
expect(pkg.devDependencies).toHaveProperty("utility-types");
expect(pkg.devDependencies).toHaveProperty("maska");
expect(pkg.scripts).toHaveProperty("lint");

// with --no-lint → skipped
// (spawn a second scaffold into another temp dir passing "--no-lint", then:)
expect(existsSync(join(noLintDir, "eslint.config.js"))).toBe(false);
expect(JSON.parse(readFileSync(join(noLintDir, "package.json"), "utf8")).devDependencies).not.toHaveProperty("eslint");
```

- [ ] **Step 7: Run the scaffold test**

Run: `yarn vitest run client-app/modules/federated/create-plugin.test.ts`
Expected: PASS (both the default and `--no-lint` scaffolds).

- [ ] **Step 8: Commit**

```bash
git add client-app/core-api/create-plugin.mjs client-app/modules/federated/create-plugin.test.ts
git commit -m "feat(VCST-5409): create:plugin emits lint/format/git-hook tooling + type-peers"
```

---

### Task 3 (A3): Publish the facade locally for co-dev (yalc)

**Files:** none (local publish only).

**Interfaces:**
- Consumes: A1's regenerated contract.
- Produces: a locally-published `@vc-frontend/core` that Phase B links via `yalc add`.

- [ ] **Step 1: Publish the facade to the local yalc store**

Run:
```bash
yarn build:core-types
cd client-app/core-api && yalc publish --private && cd -
```
Expected: `yalc` reports `@vc-frontend/core@<version> published in store.` (`--private` is required — the package is `"private": true`.)

- [ ] **Step 2: Note the published version**

Run: `node -p "require('./client-app/core-api/package.json').version"`
Expected: prints the version (record it — Phase B's plugin will pin `requiredHostVersion: "^<version>"`, which the scaffold sets automatically).

_No commit — this is a local action._

---

## PHASE B — Plugin repo (`~/vc/vc-plugins/sales-rep-plugin`)

### Task 4 (B1): Scaffold the plugin, link the facade, verify the baseline build

**Files:** the whole scaffolded project (generated), then `git init`.

**Interfaces:**
- Consumes: the enhanced generator (A2) + the yalc-published facade (A3).
- Produces: a building MF remote with `dist/mf-manifest.json`.

- [ ] **Step 1: Scaffold** (run from the host repo root so `yarn create:plugin` resolves)

```bash
mkdir -p ~/vc/vc-plugins
yarn create:plugin sales-rep ~/vc/vc-plugins/sales-rep-plugin --with-tailwind --yes
```
Expected: `Scaffolded "sales-rep" at …/sales-rep-plugin`. (`--with-tailwind` = page uses host utility classes; router is on by default; i18n/apollo/vueuse off — locale is merged via `globals.i18n`, data is mocked, and no `@vueuse/core` is needed.)

- [ ] **Step 2: Init git + link the facade + install**

```bash
cd ~/vc/vc-plugins/sales-rep-plugin
git init
yalc add @vc-frontend/core
yarn add -D vitest @vue/test-utils happy-dom
yarn install
```
Expected: install succeeds; `.yalc/@vc-frontend/core` exists; `package.json` `@vc-frontend/core` now points at the yalc link (do NOT commit that link change — restore the tarball URL before any real push, per the scaffold README).

- [ ] **Step 3: Verify the baseline build + type-check**

```bash
yarn build
yarn type-check
```
Expected: `dist/mf-manifest.json` is written and lists `exposes: [{ name: "plugin", path: "./plugin" }]`; `type-check` passes on the generated `src/index.ts` + `my-page.vue`.

- [ ] **Step 4: Add a vitest config**

```ts
// vitest.config.ts
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: { environment: "happy-dom" },
});
```
And add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 5: Commit the baseline**

```bash
git add -A
git commit -m "chore: scaffold sales-rep MF plugin (create:plugin --with-tailwind)"
```
(The `.gitignore` from the scaffold already excludes `node_modules/`, `dist/`, `.yalc/`, `yalc.lock`.)

---

### Task 5 (B2): Types, mock data, and `useSalesReps` (TDD)

**Files:**
- Create: `src/types/index.ts`, `src/api/mock.ts`, `src/composables/useSalesReps.ts`
- Test: `src/composables/useSalesReps.test.ts`

**Interfaces:**
- Produces:
  - `type SalesRep = { id: string; name: string; email: string; phone: string; isActive: boolean }`
  - `type SalesRepSortColumn = "name" | "email" | "phone"`
  - `type SalesRepSort = { column: SalesRepSortColumn; direction: "asc" | "desc" }`
  - `selectSalesReps(all: SalesRep[], opts: { keyword: string; sort: SalesRepSort; page: number; pageSize?: number }): { items: SalesRep[]; total: number }`
  - `useSalesReps(): { loading: Ref<boolean>; keyword: Ref<string>; sort: Ref<SalesRepSort>; page: Ref<number>; pages: ComputedRef<number>; items: ComputedRef<SalesRep[]> }`
  - `PAGE_SIZE` constant (10) — consumed by B4's table.

- [ ] **Step 1: Write the failing tests**

```ts
// src/composables/useSalesReps.test.ts
import { describe, expect, it } from "vitest";
import { selectSalesReps } from "./useSalesReps";
import type { SalesRep } from "../types";

const reps: SalesRep[] = [
  { id: "1", name: "Bob", email: "bob@x.com", phone: "111", isActive: true },
  { id: "2", name: "Alice", email: "alice@x.com", phone: "222", isActive: true },
  { id: "3", name: "Zed (blocked)", email: "zed@x.com", phone: "333", isActive: false },
];
const sortAsc = { column: "name", direction: "asc" } as const;

describe("selectSalesReps", () => {
  it("excludes inactive reps", () => {
    const { items, total } = selectSalesReps(reps, { keyword: "", sort: sortAsc, page: 1 });
    expect(items.map((r) => r.id)).toEqual(["2", "1"]); // Alice, Bob — sorted, Zed dropped
    expect(total).toBe(2);
  });

  it("searches name/email/phone case-insensitively", () => {
    expect(selectSalesReps(reps, { keyword: "ALICE", sort: sortAsc, page: 1 }).items.map((r) => r.id)).toEqual(["2"]);
    expect(selectSalesReps(reps, { keyword: "111", sort: sortAsc, page: 1 }).items.map((r) => r.id)).toEqual(["1"]);
  });

  it("sorts descending", () => {
    const desc = { column: "name", direction: "desc" } as const;
    expect(selectSalesReps(reps, { keyword: "", sort: desc, page: 1 }).items.map((r) => r.id)).toEqual(["1", "2"]);
  });

  it("paginates", () => {
    const { items, total } = selectSalesReps(reps, { keyword: "", sort: sortAsc, page: 2, pageSize: 1 });
    expect(total).toBe(2);
    expect(items.map((r) => r.id)).toEqual(["1"]); // page 2 of [Alice, Bob]
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `yarn test src/composables/useSalesReps.test.ts`
Expected: FAIL — cannot resolve `./useSalesReps`.

- [ ] **Step 3: Create the types**

```ts
// src/types/index.ts
export type SalesRep = { id: string; name: string; email: string; phone: string; isActive: boolean };
export type SalesRepSortColumn = "name" | "email" | "phone";
export type SalesRepSort = { column: SalesRepSortColumn; direction: "asc" | "desc" };
```

- [ ] **Step 4: Create the mock data**

```ts
// src/api/mock.ts
// MOCK: replace with a profile-experience-api GraphQL query (see useSalesReps swap point).
import type { SalesRep } from "../types";

export const MOCK_SALES_REPS: SalesRep[] = [
  { id: "1", name: "Jane Cooper", email: "jane.cooper@acme.com", phone: "+1 202 555 0148", isActive: true },
  { id: "2", name: "Wade Warren", email: "wade.warren@acme.com", phone: "+1 202 555 0172", isActive: true },
  { id: "3", name: "Esther Howard", email: "esther.howard@acme.com", phone: "+1 202 555 0193", isActive: true },
  { id: "4", name: "Cameron Williamson", email: "cameron.w@acme.com", phone: "+1 202 555 0165", isActive: true },
  { id: "5", name: "Brooklyn Simmons", email: "brooklyn.s@acme.com", phone: "+1 202 555 0119", isActive: true },
  { id: "6", name: "Leslie Alexander", email: "leslie.a@acme.com", phone: "+1 202 555 0100", isActive: true },
  { id: "7", name: "Guy Hawkins", email: "guy.hawkins@acme.com", phone: "+1 202 555 0121", isActive: true },
  { id: "8", name: "Robert Fox", email: "robert.fox@acme.com", phone: "+1 202 555 0134", isActive: true },
  { id: "9", name: "Jacob Jones", email: "jacob.jones@acme.com", phone: "+1 202 555 0157", isActive: true },
  { id: "10", name: "Kristin Watson", email: "kristin.w@acme.com", phone: "+1 202 555 0139", isActive: true },
  { id: "11", name: "Cody Fisher", email: "cody.fisher@acme.com", phone: "+1 202 555 0111", isActive: true },
  // Inactive — must never appear in the store-front (AC#5):
  { id: "12", name: "Marvin McKinney (disabled)", email: "marvin@acme.com", phone: "+1 202 555 0182", isActive: false },
];
```

- [ ] **Step 5: Implement the composable + pure helper**

```ts
// src/composables/useSalesReps.ts
import { computed, ref } from "vue";
import { MOCK_SALES_REPS } from "../api/mock";
import type { SalesRep, SalesRepSort } from "../types";

export const PAGE_SIZE = 10;

export function selectSalesReps(
  all: SalesRep[],
  { keyword, sort, page, pageSize = PAGE_SIZE }: { keyword: string; sort: SalesRepSort; page: number; pageSize?: number },
): { items: SalesRep[]; total: number } {
  const kw = keyword.trim().toLowerCase();
  const active = all.filter((r) => r.isActive);
  const matched = kw
    ? active.filter((r) => [r.name, r.email, r.phone].some((f) => f.toLowerCase().includes(kw)))
    : active;
  const dir = sort.direction === "desc" ? -1 : 1;
  const sorted = [...matched].sort((a, b) => a[sort.column].localeCompare(b[sort.column]) * dir);
  const start = (page - 1) * pageSize;
  return { items: sorted.slice(start, start + pageSize), total: sorted.length };
}

export function useSalesReps() {
  // MOCK data source. Swap point: replace MOCK_SALES_REPS with a reactive Apollo query
  // (profile-experience-api) — keep this return shape and the page needs no change.
  const loading = ref(false);
  const keyword = ref("");
  const sort = ref<SalesRepSort>({ column: "name", direction: "asc" });
  const page = ref(1);

  const result = computed(() =>
    selectSalesReps(MOCK_SALES_REPS, { keyword: keyword.value, sort: sort.value, page: page.value }),
  );
  const items = computed(() => result.value.items);
  const pages = computed(() => Math.max(1, Math.ceil(result.value.total / PAGE_SIZE)));

  return { loading, keyword, sort, page, pages, items };
}
```

- [ ] **Step 6: Run to verify pass**

Run: `yarn test src/composables/useSalesReps.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add src/types src/api src/composables/useSalesReps.ts src/composables/useSalesReps.test.ts
git commit -m "feat: sales rep types, mock data, and useSalesReps (search/sort/paginate, active-only)"
```

---

### Task 6 (B3): Config gate + constants (TDD)

**Files:**
- Create: `src/constants.ts`, `src/composables/useSalesRepsConfig.ts`
- Test: `src/composables/useSalesRepsConfig.test.ts`

**Interfaces:**
- Produces:
  - constants `MODULE_ID = "sales-rep"`, `ROLE_NAME_KEY = "SalesRep.RoleName"`, `ROUTE_NAME = "SalesReps"`, `ROUTE_SEGMENT = "sales-reps"`, `NAV_LINK_ID = "sales-reps"`.
  - `isSalesRepsEnabled(): boolean` (mock → true), `salesRepRoleName(): string` (mock default).

- [ ] **Step 1: Write the failing test**

```ts
// src/composables/useSalesRepsConfig.test.ts
import { describe, expect, it } from "vitest";
import { isSalesRepsEnabled, salesRepRoleName } from "./useSalesRepsConfig";

describe("useSalesRepsConfig (mock)", () => {
  it("is enabled and returns a non-empty role name", () => {
    expect(isSalesRepsEnabled()).toBe(true);
    expect(salesRepRoleName().length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `yarn test src/composables/useSalesRepsConfig.test.ts`
Expected: FAIL — cannot resolve `./useSalesRepsConfig`.

- [ ] **Step 3: Create constants**

```ts
// src/constants.ts
export const MODULE_ID = "sales-rep";
export const ROLE_NAME_KEY = "SalesRep.RoleName";
export const ROUTE_NAME = "SalesReps";
export const ROUTE_SEGMENT = "sales-reps";
export const NAV_LINK_ID = "sales-reps";
export const MOBILE_NAV_PRIORITY = 40; // > 30 (Company members mobile priority) → sorts after it
```

- [ ] **Step 4: Create the mock gate**

```ts
// src/composables/useSalesRepsConfig.ts
// MOCK gate. The backend module (vc-module-profile-experience-api) is not ready, so the host
// setting does not exist yet — and useModuleSettings().isEnabled() is strict `value === true`,
// which would DISABLE the plugin. So we mock enabled here.
//
// SWAP POINT (when the backend ships): read the configured role-name string —
//   import { useModuleSettings } from "@vc-frontend/core";
//   import { MODULE_ID, ROLE_NAME_KEY } from "../constants";
//   const roleName = useModuleSettings(MODULE_ID).getSettingValue(ROLE_NAME_KEY);
//   -> enabled = typeof roleName === "string" && roleName.trim().length > 0;
const MOCK_ROLE_NAME = "Sales Representative";

export function salesRepRoleName(): string {
  return MOCK_ROLE_NAME;
}

export function isSalesRepsEnabled(): boolean {
  return salesRepRoleName().trim().length > 0;
}
```

- [ ] **Step 5: Run to verify pass**

Run: `yarn test src/composables/useSalesRepsConfig.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/constants.ts src/composables/useSalesRepsConfig.ts src/composables/useSalesRepsConfig.test.ts
git commit -m "feat: plugin-local sales-rep config gate + constants"
```

---

### Task 7 (B4): The table page

**Files:**
- Create: `src/pages/sales-reps.vue`, `src/locales/en.json`
- Delete: `src/pages/my-page.vue`

**Interfaces:**
- Consumes: `useSalesReps` (B2), i18n keys under the `sales_rep` namespace.
- Produces: default-exported page component (lazy-loaded by the route in B5).

- [ ] **Step 1: Create the locale file**

```json
// src/locales/en.json
{
  "sales_rep": {
    "navigation": { "link": "Sales rep" },
    "page": { "title": "Sales reps" },
    "table": {
      "name": "Name",
      "email": "Email",
      "phone": "Phone",
      "search_placeholder": "Search sales reps",
      "empty": "No sales reps found"
    }
  }
}
```

- [ ] **Step 2: Create the page**

```vue
<!-- src/pages/sales-reps.vue -->
<template>
  <VcWidget size="lg" :title="$t('sales_rep.page.title')">
    <template #header-container>
      <VcInput
        v-model="keyword"
        :placeholder="$t('sales_rep.table.search_placeholder')"
        clearable
        class="mb-4 max-w-md"
      />
    </template>

    <template #default-container>
      <VcEmptyView v-if="!items.length && !loading" :text="$t('sales_rep.table.empty')" />
      <VcTable
        v-else
        :loading="loading"
        :items="items"
        :columns="columns"
        :sort="sort"
        :pages="pages"
        :page="page"
        @header-click="applySorting"
        @page-changed="(p: number) => (page = p)"
      >
        <template #desktop-body>
          <tr v-for="rep in items" :key="rep.id" class="border-b border-neutral-200">
            <td class="p-3">{{ rep.name }}</td>
            <td class="p-3">{{ rep.email }}</td>
            <td class="p-3">{{ rep.phone }}</td>
          </tr>
        </template>
        <template #mobile-item="{ item }">
          <div class="flex flex-col gap-1 p-3">
            <span class="font-bold">{{ item.name }}</span>
            <span>{{ item.email }}</span>
            <span>{{ item.phone }}</span>
          </div>
        </template>
      </VcTable>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { VcEmptyView, VcInput, VcTable, VcWidget } from "@vc-frontend/core";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesReps } from "../composables/useSalesReps";
import type { SalesRepSortColumn } from "../types";

const { t } = useI18n();
const { loading, keyword, sort, page, pages, items } = useSalesReps();

const columns = computed(() => [
  { id: "name", title: t("sales_rep.table.name"), sortable: true },
  { id: "email", title: t("sales_rep.table.email"), sortable: true },
  { id: "phone", title: t("sales_rep.table.phone"), sortable: true },
]);

function applySorting(column: string) {
  const col = column as SalesRepSortColumn;
  if (sort.value.column === col) {
    sort.value = { column: col, direction: sort.value.direction === "asc" ? "desc" : "asc" };
  } else {
    sort.value = { column: col, direction: "asc" };
  }
  page.value = 1;
}
</script>
```

> Note: `useI18n` requires the `vue-i18n` shared singleton. If `vue-tsc`/build reports `vue-i18n`
> unresolved, re-scaffold with `--with-i18n` or add `vue-i18n` to devDeps + `sharedOverrides`.
> The host provides the runtime instance; the plugin only needs the type-peer + shared mark.

- [ ] **Step 3: Delete the placeholder page**

```bash
rm src/pages/my-page.vue
```

- [ ] **Step 4: Type-check + build**

Run: `yarn type-check && yarn build`
Expected: both pass. If `VcTable` slot/prop names mismatch (`desktop-body`, `mobile-item`, `header-click`, `page-changed`, `sort`/`columns` shape), reconcile against the facade contract types (`node_modules/@vc-frontend/core` d.ts) — the compiler will name the exact mismatch. Fix and re-run.

- [ ] **Step 5: Commit**

```bash
git add src/pages/sales-reps.vue src/locales/en.json
git rm src/pages/my-page.vue
git commit -m "feat: sales reps table page (read-only, search + sort + pagination)"
```

---

### Task 8 (B5): `init()` — route + nav link + locale (idempotent, gated)

**Files:**
- Create: `src/routes.ts`, `src/menu.ts`, `src/index.ts`
- Test: `src/index.test.ts`
- Modify: nothing else (overwrites the scaffold's `src/index.ts`).

**Interfaces:**
- Consumes: `extendMenuSchema`, `globals`, `Vc*` from `@vc-frontend/core`; `useSalesRepsConfig`, `constants`, page component.
- Produces: `export function init(): void` — the MF expose `./plugin` entry.

- [ ] **Step 1: Write the failing idempotency + gate test**

```ts
// src/index.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const addRoute = vi.fn();
const extendMenuSchema = vi.fn();
const mergeLocaleMessage = vi.fn();

vi.mock("@vc-frontend/core", () => ({
  globals: { router: { addRoute }, i18n: { global: { locale: { value: "en" }, mergeLocaleMessage } } },
  extendMenuSchema,
}));
vi.mock("./composables/useSalesRepsConfig", () => ({ isSalesRepsEnabled: () => true }));

describe("init", () => {
  beforeEach(() => {
    vi.resetModules();
    addRoute.mockClear();
    extendMenuSchema.mockClear();
  });

  it("registers route + menu once, even if called twice (HMR re-init)", async () => {
    const { init } = await import("./index");
    init();
    init();
    expect(addRoute).toHaveBeenCalledTimes(1);
    expect(extendMenuSchema).toHaveBeenCalledTimes(1);
    expect(addRoute).toHaveBeenCalledWith("Company", expect.objectContaining({ name: "SalesReps" }));
  });

  it("does nothing when the gate is disabled", async () => {
    vi.doMock("./composables/useSalesRepsConfig", () => ({ isSalesRepsEnabled: () => false }));
    const { init } = await import("./index");
    init();
    expect(addRoute).not.toHaveBeenCalled();
    expect(extendMenuSchema).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `yarn test src/index.test.ts`
Expected: FAIL — `./routes`/`./menu` (imported by `./index`) do not exist yet.

- [ ] **Step 3: Create the route**

```ts
// src/routes.ts
import { ROUTE_NAME, ROUTE_SEGMENT } from "./constants";
import type { RouteRecordRaw } from "vue-router";

const SalesRepsPage = () => import("./pages/sales-reps.vue");

export const salesRepsRoute: RouteRecordRaw = {
  path: ROUTE_SEGMENT, // relative → mounts under the "Company" parent (/company/sales-reps)
  name: ROUTE_NAME,
  component: SalesRepsPage,
};
```

- [ ] **Step 4: Create the menu fragment**

```ts
// src/menu.ts
import { MOBILE_NAV_PRIORITY, NAV_LINK_ID, ROUTE_NAME } from "./constants";
import type { DeepPartial } from "utility-types";

// Injected into the Corporate section on both desktop and mobile. The Corporate widget is
// already gated on isCorporateMember by the host, so no extra visibility guard is needed.
const link = {
  id: NAV_LINK_ID,
  title: "sales_rep.navigation.link",
  icon: "user-group",
  route: { name: ROUTE_NAME },
};

// Typed loosely as DeepPartial<MenuType> at the call site (extendMenuSchema).
export const salesRepMenuSchema = {
  header: {
    desktop: { corporate: { children: [{ ...link }] } },
    mobile: { corporate: { children: [{ ...link, priority: MOBILE_NAV_PRIORITY }] } },
  },
} as const;
```

- [ ] **Step 5: Create `init()` (overwrite the scaffold's `src/index.ts`)**

```ts
// src/index.ts
import { extendMenuSchema, globals } from "@vc-frontend/core";
import { isSalesRepsEnabled } from "./composables/useSalesRepsConfig";
import enMessages from "./locales/en.json";
import { salesRepMenuSchema } from "./menu";
import { salesRepsRoute } from "./routes";
import type { DeepPartial } from "utility-types";
import type { MenuType } from "@vc-frontend/core";

let registered = false;

function loadLocale(): void {
  const i18n = globals.i18n.global;
  // Merge current locale + the `en` fallback so keys never render raw when current !== en.
  i18n.mergeLocaleMessage("en", enMessages);
  const current = typeof i18n.locale === "object" ? i18n.locale.value : i18n.locale;
  if (current && current !== "en") {
    // MOCK: only `en` messages exist. Real plugin: import the current-locale bundle here too.
    i18n.mergeLocaleMessage(current, enMessages);
  }
}

export function init(): void {
  if (registered) {
    return; // MF loader re-invokes on HMR; addRoute/extendMenuSchema are not idempotent.
  }
  if (!isSalesRepsEnabled()) {
    return;
  }
  registered = true;

  globals.router.addRoute("Company", salesRepsRoute);
  extendMenuSchema(salesRepMenuSchema as DeepPartial<MenuType>);
  loadLocale();
}
```

- [ ] **Step 6: Run to verify pass**

Run: `yarn test src/index.test.ts`
Expected: PASS (both tests).

- [ ] **Step 7: Type-check, run all tests, build**

Run: `yarn type-check && yarn test && yarn build`
Expected: all pass; `dist/mf-manifest.json` exposes `./plugin`.

- [ ] **Step 8: Commit**

```bash
git add src/routes.ts src/menu.ts src/index.ts src/index.test.ts
git commit -m "feat: init() registers gated /company/sales-reps route + Corporate nav link (idempotent)"
```

---

### Task 9 (B6): End-to-end verification against the host

**Files:** none (verification; commit only fixes).

**Interfaces:** consumes the built plugin + the yalc-linked facade.

- [ ] **Step 1: Serve the plugin**

```bash
# in the plugin dir
yarn build && yarn preview   # serves mf-manifest.json on http://localhost:3001
```

- [ ] **Step 2: Run the host pointed at the plugin**

In the host repo (branch `feat/VCST-5409-sales-reps`):
```bash
APP_MODULES_FEDERATION_ENABLED=true \
APP_MODULES_FEDERATION_REMOTES='{"sales-rep":"http://localhost:3001/mf-manifest.json"}' \
yarn build-only --mode=development && yarn preview
```
Expected: host boots; console shows the federated loader registering the `sales-rep` remote with no CONTRACT-GATE / shared-dep-gate error (facade versions match because of the yalc link + `requiredHostVersion` from A3).

- [ ] **Step 3: Verify in the browser** (sign in as an organization member)

Confirm each AC:
1. Under **Corporate** in the account sidebar, **Sales rep** appears after Company members.
2. Clicking it loads `/company/sales-reps` inside the account shell (sidebar visible).
3. The table lists the 11 active mock reps; the disabled one (id 12) is absent (AC#5).
4. Typing in search filters by name/email/phone; clicking a column header sorts; pagination works (set `PAGE_SIZE` lower temporarily if needed to see >1 page).
5. Sign out / use a non-organization user → hitting `/company/sales-reps` directly redirects to Account (inherited `requiresOrganization` guard).
6. Reload with HMR/re-init → the nav link is not duplicated.

- [ ] **Step 4: Record the result**

Note pass/fail per AC in the PR description. If any step fails, fix in the relevant task's files, re-run its tests, and re-verify. Commit fixes with a descriptive message.

---

## Self-Review

**Spec coverage:**
- AC#1 (back-office role) — backend, out of FE scope. ✓ (noted)
- AC#2/#3 (role-name setting gates the section) — B3 mock gate keyed on role-name string, real swap documented. ✓
- AC#4 (table Name/Email/Phone + search) — B2 + B4; facet filters consciously deferred (spec open item, signed off). ✓
- AC#5 (active only) — B2 `selectSalesReps` filters `isActive`, tested; B6 step 3. ✓
- AC#6 (not in Company members) — backend, out of FE scope. ✓ (noted)
- AC#7 (read-only) — B4 page has no actions/CRUD. ✓
- Facade menu injection — A1. UI components — A1. Scaffold tooling — A2. yalc co-dev — A3. ✓

**Placeholder scan:** No `TODO`/`TBD` in steps. `MOCK`/swap-point comments are intentional and paired with real working code. ✓

**Type consistency:** `SalesRep`/`SalesRepSort`/`SalesRepSortColumn` defined in B2 and reused in B4/B5; `selectSalesReps`/`useSalesReps`/`PAGE_SIZE` signatures consistent across B2→B4; constants (`ROUTE_NAME="SalesReps"`, `ROUTE_SEGMENT="sales-reps"`, `NAV_LINK_ID`, `MOBILE_NAV_PRIORITY`) defined in B3 and consumed in B5's `routes.ts`/`menu.ts`; `extendMenuSchema(DeepPartial<MenuType>)` matches A1's produced signature. ✓

**Known implementation-time reconciliation points** (compiler/test will pinpoint exact fixes):
- `VcTable` prop/slot/emit names + `VcTableColumnType`/sort shape (B4 step 4) — verify against the generated contract d.ts.
- `VcInput` prop names (`clearable`, `placeholder`, `v-model`) and `VcWidget` slot names (`header-container`, `default-container`) — verify against contract.
- `vue-i18n` shared singleton for `useI18n` in the page (B4 note) — may require `--with-i18n`.
