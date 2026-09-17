/**
 * Scaffolds a new Module Federation plugin project. Counterpart of
 * vc-shell's create-vc-app for this harness.
 *
 *   yarn create:plugin <plugin-name> <target-dir> [flags]
 *
 * All dependency versions are read from THIS host checkout's package.json at
 * generation time, so the plugin compiles against exactly what the host runs -
 * nothing is hardcoded to drift. Optional dependency groups are picked
 * interactively (or via flags: --yes takes defaults, --with-i18n, --with-apollo,
 * --with-vueuse, --no-router). Unselected groups are also dropped from the
 * plugin's MF shared config, so the build never needs packages it doesn't use.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import * as readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { CONTRACT_TYPE_PEERS, MF_SHARED_RANGES } from "./federation.mjs";
import { gitIn } from "./git.mjs";

const CORE_API_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CORE_API_DIR, "../..");
const require = createRequire(import.meta.url);
const hostPkg = require(resolve(REPO_ROOT, "package.json"));
const corePkg = require("./package.json");

// The facade's type-peers: every MF shared singleton (federation.mjs) is also referenced
// by the contract's own types (e.g. useModuleSettings -> @vueuse/core, apolloClient ->
// @apollo/client), so ALL of them must be installed or those facade types silently resolve
// to `any` — `skipLibCheck` (standard in the plugin tsconfig) hides the missing module.
// They are installed unconditionally below, independent of the optional runtime groups
// (which only decide MF *shared* config). Same single source of truth as the shared config.
const typePeerNames = Object.keys(MF_SHARED_RANGES).filter((name) => name !== "@vc-frontend/core");

// ── input ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const positional = args.filter((arg) => !arg.startsWith("--"));
const [pluginName, targetDirArg] = positional;

if (!pluginName || !targetDirArg) {
  console.error(
    "Usage: yarn create:plugin <plugin-name> <target-dir> [--yes] [--with-i18n] [--with-apollo] [--with-vueuse] [--with-tailwind] [--no-router]",
  );
  process.exit(1);
}
// Same fail-on-typos stance as the flag validation below: a stray third argument is
// a mistake (a mistyped flag, a forgotten quote), not something to silently ignore.
if (positional.length > 2) {
  console.error(
    `Unexpected argument(s): ${positional.slice(2).join(", ")} — expected <plugin-name> <target-dir> only.`,
  );
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(pluginName)) {
  console.error(`Plugin name "${pluginName}" must be kebab-case ([a-z][a-z0-9-]*) - it becomes the MF remote name.`);
  process.exit(1);
}
const targetDir = resolve(process.cwd(), targetDirArg);
if (existsSync(join(targetDir, "package.json"))) {
  console.error(`Target ${targetDir} already contains a package.json - refusing to overwrite.`);
  process.exit(1);
}

function hostVersion(name) {
  const version = hostPkg.dependencies?.[name] ?? hostPkg.devDependencies?.[name];
  if (!version) {
    console.error(`Cannot read the host version of "${name}" from package.json.`);
    process.exit(1);
  }
  return version;
}

// ── optional dependency groups ────────────────────────────────────────────────
const GROUPS = [
  {
    key: "router",
    flag: "--no-router",
    inverted: true,
    defaultOn: true,
    prompt: "vue-router (plugin adds routes/pages)",
    packages: ["vue-router"],
  },
  {
    key: "i18n",
    flag: "--with-i18n",
    defaultOn: false,
    prompt: "vue-i18n (plugin-local translations)",
    packages: ["vue-i18n"],
  },
  {
    key: "apollo",
    flag: "--with-apollo",
    defaultOn: false,
    prompt: "Apollo GraphQL (@apollo/client + composable + graphql)",
    packages: ["@apollo/client", "@vue/apollo-composable", "graphql"],
  },
  {
    key: "vueuse",
    flag: "--with-vueuse",
    defaultOn: false,
    prompt: "@vueuse/core (composition utilities)",
    packages: ["@vueuse/core"],
  },
  {
    key: "tailwind",
    flag: "--with-tailwind",
    defaultOn: false,
    prompt: "Tailwind CSS (host design tokens, plugin-local utility pass)",
    packages: [],
  },
];

// Fail on typos ("--tailwind", "--with-apollos") instead of silently ignoring them:
// in a non-interactive run (--yes / CI) there is no prompt to catch the mistake, so an
// unknown flag would silently scaffold WITHOUT the requested group.
const KNOWN_FLAGS = new Set(["--yes", ...GROUPS.map((group) => group.flag)]);
const unknownFlags = [...flags].filter((flag) => !KNOWN_FLAGS.has(flag));
if (unknownFlags.length > 0) {
  console.error(`Unknown flag(s): ${unknownFlags.join(", ")}. Known flags: ${[...KNOWN_FLAGS].join(", ")}`);
  process.exit(1);
}

async function selectGroups() {
  const selection = {};
  const interactive = process.stdin.isTTY && !flags.has("--yes");
  const rl = interactive ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
  for (const group of GROUPS) {
    const flagged = flags.has(group.flag);
    let enabled = group.inverted ? group.defaultOn && !flagged : group.defaultOn || flagged;
    if (rl && !flagged) {
      const hint = group.defaultOn ? "[Y/n]" : "[y/N]";
      const answer = (await rl.question(`Include ${group.prompt}? ${hint} `)).trim().toLowerCase();
      if (answer) {
        enabled = answer.startsWith("y");
      }
    }
    selection[group.key] = enabled;
  }
  rl?.close();
  return selection;
}

const selected = await selectGroups();

// ── assemble dependencies ─────────────────────────────────────────────────────
const runtimeDeps = ["vue", ...GROUPS.filter((group) => selected[group.key]).flatMap((group) => group.packages)];
const toolDeps = [
  "typescript",
  "vite",
  "@vitejs/plugin-vue",
  "@module-federation/vite",
  "vue-tsc",
  // The host's lint/format/test stack, so a plugin is reviewed against the same conventions.
  "eslint",
  "@vue/eslint-config-typescript",
  "eslint-plugin-vue",
  "eslint-plugin-prettier",
  "eslint-config-prettier",
  "typescript-eslint",
  "globals",
  "prettier",
  "vitest",
  "jsdom",
];
if (selected.apollo) {
  // A plugin with its own xAPI scope generates its documents' types, like every host module does.
  toolDeps.push(
    "@graphql-codegen/cli",
    "@graphql-codegen/add",
    "@graphql-codegen/typescript",
    "@graphql-codegen/typescript-operations",
    "@graphql-codegen/typed-document-node",
    "@graphql-codegen/named-operations-object",
    // The generated types.ts imports it; the host leans on a transitive copy, a plugin should not.
    "@graphql-typed-document-node/core",
  );
}
if (selected.tailwind) {
  // The last two are required by the host's tailwind preset (its `plugins` entries
  // resolve from THIS plugin's node_modules — the preset snapshot cannot carry code).
  toolDeps.push(
    "tailwindcss",
    "postcss",
    "autoprefixer",
    "postcss-import",
    "@tailwindcss/container-queries",
    "tw-elements",
  );
}

// The committed form of the facade dependency: a versioned tarball published as a
// GitHub Release asset of the (public) host repo by the "Core Facade Release"
// workflow. No registry, token, or account — any package manager can install it,
// and the consumer's lockfile records the tarball checksum (tamper-evident pin).
// Local co-dev against an unpushed facade uses yalc instead (see HOWTO.md).
const HOST_REPO = "VirtoCommerce/vc-frontend";
const coreTarballUrl = `https://github.com/${HOST_REPO}/releases/download/core-v${corePkg.version}/vc-frontend-core-${corePkg.version}.tgz`;

/**
 * Scaffolding from a branch that bumped the contract pins a tarball nobody published, and
 * `yarn install` then fails with a bare 404. Local tags only; no `core-v*` tag at all means
 * tags were never fetched, so absence proves nothing.
 */
function pinnedReleaseIsMissing() {
  const tags = gitIn(REPO_ROOT)(["tag", "--list", "core-v*"]);
  if (tags.status !== 0 || !tags.stdout.trim()) {
    return false;
  }
  return !tags.stdout.split("\n").some((tag) => tag.trim() === `core-v${corePkg.version}`);
}

// Optional groups the plugin does not USE at runtime are dropped from its MF shared config.
// (They may still be installed as type-peers via typePeerNames, but declaring an unused
// singleton as shared only risks a spurious version-gate failure at load — so drop it.)
// Derived from GROUPS so the group→packages mapping lives in exactly one place
// (tailwind's empty `packages` self-excludes).
const droppedShared = GROUPS.filter((group) => !selected[group.key]).flatMap((group) => group.packages);
const droppedSharedLines = droppedShared
  .map((name) => `          "${name}": false, // not used by this plugin`)
  .join("\n");
const sharedOverridesArg = droppedShared.length
  ? `\n        sharedOverrides: {\n${droppedSharedLines}\n        },`
  : "";

// ── file templates ────────────────────────────────────────────────────────────
const sortedEntries = (names) =>
  Object.fromEntries(names.sort((a, b) => a.localeCompare(b)).map((name) => [name, hostVersion(name)]));

// Merge dependency maps left-to-right (earlier map wins on conflicts — so a group's
// host-pinned version beats a contract-peer fallback), returning a name-sorted object.
const mergeDeps = (...maps) => {
  const merged = {};
  for (const map of maps) {
    for (const [name, range] of Object.entries(map)) {
      merged[name] ??= range;
    }
  }
  return Object.fromEntries(
    Object.keys(merged)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => [name, merged[name]]),
  );
};

const pkgJson = {
  name: pluginName,
  version: "1.0.0",
  private: true,
  type: "module",
  // Without it `yarn install` runs whatever yarn is on PATH; yarn 1 ignores .yarnrc.yml below.
  packageManager: hostPkg.packageManager,
  scripts: {
    build: "vite build",
    // Auto-rebuild dist/ on save; pair with `preview` for a build+reload loop.
    watch: "vite build --watch",
    preview: "vite preview --port 3001",
    // HMR remote: run the plugin as its own dev server so edits hot-update live inside
    // a host that is itself running `yarn dev` (see HOWTO "Dev inner loop").
    dev: "vite --port 3001",
    "type-check": "vue-tsc --noEmit",
    lint: "eslint . --fix",
    format: "prettier --write src/",
    test: "vitest run",
    "test:watch": "vitest",
    ...(selected.apollo ? { "generate:graphql-types": "graphql-codegen --config codegen.ts" } : {}),
  },
  dependencies: { "@vc-frontend/core": coreTarballUrl },
  // Compile-time only — nothing here ships in the bundle: packages the plugin imports are
  // MF-shared (import: false, borrowed from the host at runtime); the rest are type-peers
  // and tooling, tree-shaken away. `typePeerNames` ensures every facade type-peer is present
  // even when its optional runtime group wasn't selected (see the note at the top of file).
  // The facade's own peerDependencies come last and cover everything its PUBLISHED files import,
  // optional subpath peers included — a package manager installs none of them on its own, and
  // `lodash-es` (imported at runtime by @vc-frontend/core/testing) is why the first spec in a
  // scaffolded plugin used to die on `Cannot find module`. build-types.mjs keeps that list honest.
  devDependencies: mergeDeps(
    sortedEntries(runtimeDeps),
    sortedEntries(toolDeps),
    sortedEntries(typePeerNames),
    CONTRACT_TYPE_PEERS,
    corePkg.peerDependencies ?? {},
  ),
};

const viteConfig = `import { federation } from "@module-federation/vite";
import { createRemoteFederationOptions } from "@vc-frontend/core/federation";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue(),
    // Wiring conventions (expose key, shared singletons, manifest metadata) come from
    // the host - client-app/core-api/federation.mjs in the host checkout owns them.
    federation(
      createRemoteFederationOptions({
        name: "${pluginName}",
        // CONTRACT GATE: the facade version this plugin is built against. The loader takes this
        // range at face value, so widening it is a claim of compatibility, not a request for one:
        // a host whose version falls INSIDE the range still loads you even if you never tested
        // against it. A host OUTSIDE the range is refused before any of your code runs.
        requiredHostVersion: "^${corePkg.version}",${sharedOverridesArg}
      }),
    ),
  ],
  build: { target: "esnext" }, // MF entry uses top-level await
  server: { port: 3001, cors: true, origin: "http://localhost:3001" },
  preview: { cors: true },
});
`;

const tailwindConfig = `const path = require("path");
const hostPreset = require("@vc-frontend/core/tailwind-preset");

// The HOST's design system (colors via CSS custom properties, spacing, breakpoints),
// scanning ONLY this plugin's sources - utilities match the host 1:1.
const preset = hostPreset.default ?? hostPreset;

module.exports = {
  ...preset,
  content: [path.resolve(__dirname, "index.html"), path.resolve(__dirname, "src/**/*.{vue,js,ts}")],
};
`;

const postcssConfig = `const path = require("path");

// Same pipeline as the host, with Tailwind pinned to THIS plugin's config so it scans
// the plugin's own sources and generates the utilities its templates use.
module.exports = {
  plugins: {
    "postcss-import": {},
    "tailwindcss/nesting": {},
    tailwindcss: { config: path.resolve(__dirname, "tailwind.config.cjs") },
    autoprefixer: {},
  },
};
`;

const stylesCss = `/*
 * Plugin utility layer: only components + utilities - NOT base, so the host's
 * Tailwind preflight/reset is not re-injected (it is already applied globally).
 * The CSS custom properties these utilities reference are defined by the host.
 */
@tailwind components;
@tailwind utilities;
`;

const tsconfig = {
  compilerOptions: {
    target: "ESNext",
    module: "ESNext",
    moduleResolution: "Bundler",
    lib: ["ESNext", "DOM"],
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    resolveJsonModule: true,
    verbatimModuleSyntax: true,
    types: ["vite/client"],
  },
  include: ["src", "vite.config.ts"],
  // Off by default an unknown component is accepted silently, props unchecked. The contract
  // declares the ui-kit components the facade exports, so host tags survive the strictness.
  vueCompilerOptions: { strictTemplates: true },
};

const stylesImport = selected.tailwind ? 'import "./styles.css";\n' : "";
const indexTs = selected.router
  ? `${stylesImport}import { globals } from "@vc-frontend/core";
import type { RouteRecordRaw } from "vue-router";

const MyPage = () => import("./pages/my-page.vue");

const route: RouteRecordRaw = { path: "/${pluginName}", name: "${pluginName}", component: MyPage };

export function init(): void {
  globals.router.addRoute(route);
}
`
  : `${stylesImport}export function init(): void {
  // Wire your plugin here (extension points, listeners, ...) using @vc-frontend/core.
}
`;

const pageClass = selected.tailwind ? ' class="p-6 text-primary-700"' : "";
const myPageVue = `<template>
  <div${pageClass}>
    <h1>${pluginName}</h1>
    <p>Served by Module Federation - built and deployed separately from the host.</p>
  </div>
</template>
`;

const shimsVue = `declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
`;

// Vite needs an HTML entry even for a remote; opening it directly is not meaningful -
// the plugin only runs inside the host via Module Federation.
const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${pluginName} remote</title>
  </head>
  <body>
    <p>This is a Module Federation remote; it runs inside the storefront host.</p>
    <script type="module" src="/src/index.ts"></script>
  </body>
</html>
`;

const readme = `# ${pluginName}

A Module Federation plugin for the VC storefront, scaffolded by \`yarn create:plugin\`.

- Build: \`yarn build\` - Serve for the host: \`yarn preview\` (port 3001)
- Check it: \`yarn lint\`, \`yarn type-check\`, \`yarn test\` - the host's own stack, pinned to the
  host's versions. Templates are type-checked strictly, and the facade declares every ui-kit
  component it exports, so \`<VcButton>\` is checked without importing it.
${
  selected.apollo
    ? "- Your xAPI types: write `.graphql` documents under `src/api/graphql/`, then `yarn generate:graphql-types`\n  (needs `APP_BACKEND_URL` - copy `.env.example`). Commit the generated `types.ts`; the build must not need a backend.\n"
    : ""
}- Full walkthrough (running against the host, shipping, versioning):
  the host repo's \`client-app/modules/federated/HOWTO.md\`.

## The facade dependency

\`@vc-frontend/core\` is pinned to a versioned tarball URL (a Release asset of the host
repo) - the lockfile records its checksum. **Keep it that way in commits.** For local
co-development against an unpushed facade, use yalc (\`yalc add @vc-frontend/core\`);
run \`yalc remove @vc-frontend/core\` and restore the pinned URL before pushing - never
commit a \`file:.yalc/...\` dependency. A \`portal:\`/\`link:\` pin is not an alternative: it
symlinks, so the facade's types resolve their own imports from the host's node_modules and
\`@vue/test-utils\` ends up with two identities.
`;

// Platform discovery descriptor. Without it AppManifestService assumes its own defaults —
// remote name = the .NET module id and expose "./Module" — and the host would loadRemote a key this
// plugin does not export. Vite copies `public/` into `dist/`, next to remoteEntry.js.
const pluginJson = {
  id: pluginName,
  remote: { name: pluginName, exposed: "./plugin" },
};

const eslintConfig = `import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import prettier from "eslint-plugin-prettier/recommended";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

// The host's flat config, trimmed to what a standalone plugin needs.
export default defineConfigWithVueTs(
  { ignores: ["dist/", "node_modules/", ".yalc/", "src/api/graphql/types.ts"] },
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  { languageOptions: { globals: { ...globals.browser } } },
  {
    rules: {
      // \`_\`-prefixed is the deliberate "unused" convention.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Both off in the host: pages are named after their route segment, props use \`defineProps<IProps>()\`.
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
    },
  },
  {
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  prettier,
);
`;

const prettierRc = {
  $schema: "https://json.schemastore.org/prettierrc",
  endOfLine: "auto",
};

const editorConfig = `# Editor configuration, see https://editorconfig.org
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
max_line_length = 120
trim_trailing_whitespace = true

[*.{vue,js,ts,scss}]
quote_type = double

[*.md]
max_line_length = off
trim_trailing_whitespace = false
`;

const vscodeSettings = {
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "eslint.useFlatConfig": true,
};

const vscodeExtensions = {
  // Volar carries the strictTemplates checking; without it the editor accepts what type-check rejects.
  recommendations: ["Vue.volar", "dbaeumer.vscode-eslint", "esbenp.prettier-vscode", "EditorConfig.EditorConfig"],
};

const FACADE_MOCK_PATH = "src/mocks/vc-frontend-core.ts";

const codegenConfig = `import { CODEGEN_CONFIG, CODEGEN_PLUGINS } from "@vc-frontend/core/codegen";
import { loadEnv } from "vite";
import type { CodegenConfig } from "@graphql-codegen/cli";

// graphql-codegen reads no .env of its own; reuse Vite's loader so one file serves both. The
// shell wins over .env.
const env = { ...loadEnv("", process.cwd(), ""), ...process.env };

if (!env.APP_BACKEND_URL) {
  throw new Error("APP_BACKEND_URL is not set - copy .env.example to .env, or export it.");
}

const codegen: CodegenConfig = {
  // A backend module that registers its own schema (ScopedSchemaFactory) serves it under its
  // scope name; plain \`/graphql\` is the storefront schema.
  schema: \`\${env.APP_BACKEND_URL}/graphql/${pluginName}\`,
  documents: "src/api/graphql/**/*.graphql",
  // Scalars and plugins come from the host so the same backend value never gets two different
  // TypeScript types.
  generates: { "src/api/graphql/types.ts": { plugins: CODEGEN_PLUGINS, config: CODEGEN_CONFIG } },
};

export default codegen;
`;

const envExample = `# Backend whose GraphQL schema \`yarn generate:graphql-types\` introspects (see codegen.ts).
# Copy to .env (gitignored) and adjust.
APP_BACKEND_URL=https://localhost:5001
`;

// Valid against any Virto schema, so the first \`yarn generate:graphql-types\` succeeds and shows
// what the output looks like. Replace it with your own operations.
const sampleDocument = `query PluginPing {
  __typename
}
`;

const vitestConfig = String.raw`import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      // The facade is types-only at runtime, so Vite has no entry to resolve and a spec dies
      // before vi.mock() can substitute anything. A regex, not a string: a string key matches by
      // PREFIX and would swallow "@vc-frontend/core/testing" too.
      {
        find: /^@vc-frontend\/core$/,
        replacement: fileURLToPath(new URL("./${FACADE_MOCK_PATH}", import.meta.url)),
      },
    ],
  },
  test: { environment: "jsdom" },
});
`;

const facadeMock = `// Test-only resolution target for "@vc-frontend/core" (see the alias in vitest.config.ts).
// Mocking the facade is wholesale, so this carries working defaults and specs SPREAD it:
//
//   vi.mock("@vc-frontend/core", async (importOriginal) => ({
//     ...(await importOriginal<Record<string, unknown>>()),
//     globals: { storeId: "test-store" },
//   }));
//
// Add the symbols your plugin uses.
export const SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT = { suppressErrorNotifications: true };

export const Logger = { error: () => {}, warn: () => {}, info: () => {}, debug: () => {} };

export const globals = {
  storeId: "test-store",
  cultureName: "en-US",
  currencyCode: "USD",
  i18n: undefined,
  router: undefined,
};

export const useUser = () => ({ checkPermissions: () => true });
export const useModuleSettings = () => ({ isEnabled: () => true, getModuleSettings: () => undefined });
export const useModal = () => ({ openModal: () => {}, closeModal: () => {} });
export const useNotifications = () => ({ success: () => {}, error: () => {}, warning: () => {}, info: () => {} });
export const useNavigations = () => ({ mergeMenuSchema: () => {}, registerAccountSection: () => {} });
export const useExtensionRegistry = () => ({ register: () => {}, registerContribution: () => {} });
export const usePageHead = () => {};
export const registerLocaleLoader = () => {};
export const registerCacheTypePolicies = () => {};
`;

const samplePage = "my-page";
const sampleSpec = `import { mount } from "@vue/test-utils";
import { createWrapperFactory } from "@vc-frontend/core/testing";
import { describe, expect, it } from "vitest";
import MyPage from "./${samplePage}.vue";

// createWrapperFactory supplies what a host-rendered component expects: \`$t\`, router stubs, i18n.
const createWrapper = createWrapperFactory(mount, MyPage);

describe("${pluginName} page", () => {
  it("renders", () => {
    expect(createWrapper().text()).toContain("${pluginName}");
  });
});
`;

// ── write ─────────────────────────────────────────────────────────────────────
mkdirSync(join(targetDir, "src", "pages"), { recursive: true });
mkdirSync(join(targetDir, "public"), { recursive: true });
writeFileSync(join(targetDir, "package.json"), JSON.stringify(pkgJson, null, 2) + "\n");
writeFileSync(join(targetDir, "index.html"), indexHtml);
writeFileSync(join(targetDir, "vite.config.ts"), viteConfig);
writeFileSync(join(targetDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2) + "\n");
writeFileSync(join(targetDir, "src", "index.ts"), indexTs);
if (selected.router) {
  writeFileSync(join(targetDir, "src", "pages", "my-page.vue"), myPageVue);
}
if (selected.tailwind) {
  writeFileSync(join(targetDir, "tailwind.config.cjs"), tailwindConfig);
  writeFileSync(join(targetDir, "postcss.config.cjs"), postcssConfig);
  writeFileSync(join(targetDir, "src", "styles.css"), stylesCss);
}
writeFileSync(join(targetDir, "public", "plugin.json"), JSON.stringify(pluginJson, null, 2) + "\n");
writeFileSync(join(targetDir, "src", "shims-vue.d.ts"), shimsVue);
writeFileSync(join(targetDir, "README.md"), readme);
writeFileSync(join(targetDir, "eslint.config.js"), eslintConfig);
writeFileSync(join(targetDir, ".prettierrc.json"), JSON.stringify(prettierRc, null, 2) + "\n");
writeFileSync(
  join(targetDir, ".prettierignore"),
  "dist/\nnode_modules/\n.yalc/\nyarn.lock\nsrc/api/graphql/types.ts\n",
);
writeFileSync(join(targetDir, ".editorconfig"), editorConfig);
mkdirSync(join(targetDir, ".vscode"), { recursive: true });
writeFileSync(join(targetDir, ".vscode", "settings.json"), JSON.stringify(vscodeSettings, null, 2) + "\n");
writeFileSync(join(targetDir, ".vscode", "extensions.json"), JSON.stringify(vscodeExtensions, null, 2) + "\n");
writeFileSync(join(targetDir, "vitest.config.ts"), vitestConfig);
mkdirSync(join(targetDir, "src", "mocks"), { recursive: true });
writeFileSync(join(targetDir, FACADE_MOCK_PATH), facadeMock);
if (selected.router) {
  writeFileSync(join(targetDir, "src", "pages", `${samplePage}.test.ts`), sampleSpec);
}
if (selected.apollo) {
  mkdirSync(join(targetDir, "src", "api", "graphql", "queries", "ping"), { recursive: true });
  writeFileSync(join(targetDir, "codegen.ts"), codegenConfig);
  writeFileSync(join(targetDir, ".env.example"), envExample);
  writeFileSync(join(targetDir, "src", "api", "graphql", "queries", "ping", "pingQuery.graphql"), sampleDocument);
}
// yalc artifacts (local facade co-dev) must never be committed - see README.
writeFileSync(join(targetDir, ".gitignore"), "node_modules/\ndist/\n.yalc/\nyalc.lock\n.env\n");
// Standalone project: keep Yarn out of the host's workspace/PnP context.
writeFileSync(join(targetDir, ".yarnrc.yml"), "nodeLinker: node-modules\n");

if (pinnedReleaseIsMissing()) {
  console.log(
    `\n!! @vc-frontend/core ${corePkg.version} is not released yet — \`core-v${corePkg.version}\` has no tag, so the\n` +
      `   pin this scaffold wrote 404s on install. Until the "Core Facade Release" workflow publishes it,\n` +
      "   link the local facade instead (yalc copies files, so types resolve against THIS plugin's\n" +
      "   node_modules — a `portal:`/`link:` pin resolves them against the host's and breaks the\n" +
      "   @vue/test-utils helpers with a private-property mismatch):\n" +
      "     (host)   yarn core:yalc-push\n" +
      "     (plugin) npx yalc add @vc-frontend/core && yarn install\n" +
      "   Restore the pinned tarball URL before committing.",
  );
}

console.log(`\nScaffolded "${pluginName}" at ${targetDir}`);
console.log(`  deps pinned from host: ${runtimeDeps.join(", ")}`);
if (droppedShared.length) {
  console.log(`  dropped from MF shared (unused at runtime): ${droppedShared.join(", ")}`);
}
console.log(`\nNext steps:
  cd ${relative(process.cwd(), targetDir) || "."}
  yarn install
  yarn build && yarn preview   # serves mf-manifest.json on :3001

Then point the host at it (--mode=development so the store resolves from APP_BACKEND_URL, not the hostname):
  APP_MODULES_FEDERATION_ENABLED=true APP_MODULES_FEDERATION_REMOTES='{"${pluginName}":"http://localhost:3001/mf-manifest.json"}' yarn build-only --mode=development && yarn preview

@vc-frontend/core is pinned to the core-v${corePkg.version} release asset. If that release
has not been published yet, yarn install will 404 - either run the "Core Facade Release"
workflow in the host repo once, or work purely locally with yalc:
  (host)   yarn build:core-types && cd client-app/core-api && yalc publish --private
  (plugin) yalc add @vc-frontend/core
`);
