/**
 * Scaffolds a new Module Federation plugin project. Counterpart of
 * vc-shell's create-vc-app for this harness.
 *
 *   yarn create:plugin <plugin-name> <target-dir> [flags]
 *   yarn create:plugin <plugin-name> --module <path-to-*.Web> [flags]
 *
 * --module scaffolds into a backend module (`<Web>/StorefrontApp/`, built into the folder the
 * platform probes, plus the MSBuild targets that package it). It only creates files: the edits to
 * the module's own files are printed, and check:plugin-module verifies them.
 *
 * All dependency versions are read from THIS host checkout's package.json at
 * generation time, so the plugin compiles against exactly what the host runs -
 * nothing is hardcoded to drift. Optional dependency groups are picked
 * interactively (or via flags: --yes takes defaults, --with-i18n, --with-apollo,
 * --with-vueuse, --with-tailwind, --no-router). Unselected groups are also dropped from the
 * plugin's MF shared config, so the build never needs packages it doesn't use.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import * as readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { lt, minVersion } from "semver";
import { CONTRACT_TYPE_PEERS, MF_SHARED_RANGES } from "./federation.mjs";
import { gitIn } from "./git.mjs";
import {
  PLUGIN_OUT_DIR,
  STOREFRONT_APP_DIR,
  STOREFRONT_PLUGIN_TARGETS,
  TARGETS_FILE,
  checkModuleFiles,
  formatResults,
  parseModuleManifest,
} from "./plugin-module.mjs";

const CORE_API_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CORE_API_DIR, "../..");
const require = createRequire(import.meta.url);
const hostPkg = require(resolve(REPO_ROOT, "package.json"));
const corePkg = require("./package.json");
// The storefront's languages, read from its own locales/: a language the host adds reaches every new plugin.
const HOST_LOCALES = readdirSync(resolve(REPO_ROOT, "locales"))
  .filter((name) => /^[a-z]{2}\.json$/.test(name))
  .map((name) => name.slice(0, -".json".length))
  .sort((a, b) => a.localeCompare(b));

// The facade's type-peers: every MF shared singleton (federation.mjs) is also referenced
// by the contract's own types (e.g. useModuleSettings -> @vueuse/core, apolloClient ->
// @apollo/client), so ALL of them must be installed or those facade types silently resolve
// to `any` — `skipLibCheck` (standard in the plugin tsconfig) hides the missing module.
// They are installed unconditionally below, independent of the optional runtime groups
// (which only decide MF *shared* config). Same single source of truth as the shared config.
const typePeerNames = Object.keys(MF_SHARED_RANGES).filter((name) => name !== "@vc-frontend/core");

// ── input ─────────────────────────────────────────────────────────────────────
const USAGE_FLAGS = "[--yes] [--with-i18n] [--with-apollo] [--with-vueuse] [--with-tailwind] [--no-router]";
const USAGE =
  `Usage: yarn create:plugin <plugin-name> <target-dir> ${USAGE_FLAGS}\n` +
  `       yarn create:plugin <plugin-name> --module <path-to-*.Web> ${USAGE_FLAGS}`;

const args = process.argv.slice(2);
const flags = new Set();
const positional = [];
let moduleArg;
for (let index = 0; index < args.length; index++) {
  const arg = args[index];
  if (arg === "--module" || arg.startsWith("--module=")) {
    moduleArg = arg === "--module" ? args[++index] : arg.slice("--module=".length);
    if (!moduleArg || moduleArg.startsWith("--")) {
      console.error(`--module needs the path of the module's *.Web project.\n${USAGE}`);
      process.exit(1);
    }
  } else if (arg.startsWith("--")) {
    flags.add(arg);
  } else {
    positional.push(arg);
  }
}
const [pluginName, targetDirArg] = positional;
const expectedPositional = moduleArg ? 1 : 2;

if (!pluginName || (!moduleArg && !targetDirArg)) {
  console.error(USAGE);
  process.exit(1);
}
// Same fail-on-typos stance as the flag validation below: a stray argument is a mistake
// (a mistyped flag, a forgotten quote), not something to silently ignore.
if (positional.length > expectedPositional) {
  const expected = moduleArg ? "<plugin-name> --module <path>" : "<plugin-name> <target-dir>";
  console.error(
    `Unexpected argument(s): ${positional.slice(expectedPositional).join(", ")} — expected ${expected} only.`,
  );
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(pluginName)) {
  console.error(`Plugin name "${pluginName}" must be kebab-case ([a-z][a-z0-9-]*) - it becomes the MF remote name.`);
  process.exit(1);
}

const webDir = moduleArg ? resolve(process.cwd(), moduleArg) : undefined;
if (webDir) {
  const isModuleWebProject =
    existsSync(join(webDir, "module.manifest")) && readdirSync(webDir).some((name) => name.endsWith(".csproj"));
  if (!isModuleWebProject) {
    console.error(`${webDir} is not a module's *.Web project: it needs module.manifest and a .csproj.`);
    process.exit(1);
  }
}
const targetDir = webDir ? join(webDir, STOREFRONT_APP_DIR) : resolve(process.cwd(), targetDirArg);
if (webDir && existsSync(targetDir)) {
  console.error(`${targetDir} already exists - refusing to overwrite.`);
  process.exit(1);
}
// Every file any option can write: refusing here spares a human the questions below. The check
// on the exact plan, after them, stays the one that guarantees nothing is overwritten.
const ANY_SCAFFOLD_FILE = [
  "package.json",
  "index.html",
  "vite.config.ts",
  "plugin.config.ts",
  "tsconfig.json",
  "src/index.ts",
  "src/i18n.ts",
  ...HOST_LOCALES.map((locale) => `src/locales/${locale}.json`),
  "src/pages/my-page.vue",
  "src/pages/my-page.test.ts",
  "src/styles.css",
  "src/shims-vue.d.ts",
  "src/mocks/vc-frontend-core.ts",
  "src/api/graphql/queries/ping/pingQuery.graphql",
  "public/plugin.json",
  "tailwind.config.cjs",
  "postcss.config.cjs",
  "codegen.ts",
  ".env.example",
  "README.md",
  "CLAUDE.md",
  "eslint.config.js",
  "vitest.config.ts",
  ".prettierrc.json",
  ".prettierignore",
  ".editorconfig",
  ".vscode/settings.json",
  ".vscode/extensions.json",
  ".gitignore",
  "yarn.lock",
  ".yarnrc.yml",
];
const takenUpFront = ANY_SCAFFOLD_FILE.filter((file) => existsSync(join(targetDir, file)));
if (takenUpFront.length) {
  console.error(
    `${targetDir} already has ${takenUpFront.join(", ")} - refusing to overwrite. Scaffold into a folder without them.`,
  );
  process.exit(1);
}

/** Relative to where the command ran, unless the absolute path is shorter. */
function shownPath(path) {
  const fromHere = relative(process.cwd(), path) || ".";
  return fromHere.length <= path.length ? fromHere : path;
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
    prompt: "vue-i18n (its own messages, merged into the storefront's i18n)",
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
// Local co-dev against an unpushed facade uses yalc instead (scenario S2.3).
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
// (They may still be installed as type-peers via typePeerNames.) This keeps the shared config to
// what the plugin imports; a version mismatch on a shared entry is only logged at load (VCST-6330).
// Derived from GROUPS so the group→packages mapping lives in exactly one place
// (tailwind's empty `packages` self-excludes).
const droppedShared = GROUPS.filter((group) => !selected[group.key]).flatMap((group) => group.packages);
// Keys quoted only where JS requires it, as prettier prints them - the scaffold must pass its own lint.
const objectKey = (name) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name));
const droppedSharedLines = droppedShared
  .map((name) => `          ${objectKey(name)}: false, // not shared: delete this line before importing it`)
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
    // a host that is itself running `yarn dev` (scenario S2.1).
    dev: "vite --port 3001",
    "type-check": "vue-tsc --noEmit",
    lint: "eslint .",
    "lint:fix": "eslint . --fix",
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

// Below this version @module-federation/vite resolves `import type` sources under the exposed module
// and throws on a types-only package, which the generated GraphQL types import.
const MF_VITE_TYPE_IMPORT_FIX = "1.23.1";
const needsTypedDocumentAlias =
  selected.apollo && lt(minVersion(hostVersion("@module-federation/vite")), MF_VITE_TYPE_IMPORT_FIX);
const typedDocumentAlias = needsTypedDocumentAlias
  ? `
  resolve: {
    alias: {
      // @module-federation/vite below ${MF_VITE_TYPE_IMPORT_FIX} resolves \`import type\` sources too and throws on this
      // types-only package; nothing loads it at runtime. Drop it once this plugin's own
      // @module-federation/vite is past that version.
      "@graphql-typed-document-node/core": fileURLToPath(
        new URL("./node_modules/@graphql-typed-document-node/core/typings/index.d.ts", import.meta.url),
      ),
    },
  },`
  : "";
const buildConfig = webDir
  ? `
  build: {
    target: "esnext", // MF entry uses top-level await
    // The platform probes {moduleRoot}/plugins/vc-frontend/ of every installed module.
    outDir: "${PLUGIN_OUT_DIR}",
    emptyOutDir: true,
  },`
  : `
  build: { target: "esnext" }, // MF entry uses top-level await`;

const viteConfig = `${needsTypedDocumentAlias ? 'import { fileURLToPath } from "node:url";\n' : ""}import { federation } from "@module-federation/vite";
import { createRemoteFederationOptions } from "@vc-frontend/core/federation";
import { pluginContributions } from "@vc-frontend/core/manifest";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import contributions from "./plugin.config";

export default defineConfig({
  plugins: [
    vue(),
    // Writes plugin.config.ts into the built plugin.json.
    pluginContributions(contributions),
    // Wiring conventions (expose key, shared singletons, manifest metadata) come from
    // the host - client-app/core-api/federation.mjs in the host checkout owns them.
    federation(
      createRemoteFederationOptions({
        name: "${pluginName}",
        // CONTRACT GATE: the facade versions this plugin runs on. A host OUTSIDE the range is
        // refused before any of your code runs. Keep it ^ the facade you pin: check:plugin-module
        // fails a range that reaches below the pin or past its breaking line (README, rule 5).
        requiredHostVersion: "^${corePkg.version}",${sharedOverridesArg}
      }),
    ),
  ],${typedDocumentAlias}${buildConfig}
  // No cors option: Vite's default lets in localhost origins only, which is where a local storefront runs.
  server: { port: 3001, origin: "http://localhost:3001" },
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
    // DOM.Iterable: spreading a NodeList or FormData, as host code does, fails type-check without it.
    lib: ["ESNext", "DOM", "DOM.Iterable"],
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    resolveJsonModule: true,
    verbatimModuleSyntax: true,
    // The facade is listed so its GlobalComponents declaration loads even when no file imports it.
    types: ["vite/client", "@vc-frontend/core"],
  },
  include: ["src", "vite.config.ts", "plugin.config.ts"],
  // Off by default an unknown component is accepted silently, props unchecked. The contract
  // declares the ui-kit components the facade exports, so host tags survive the strictness.
  vueCompilerOptions: { strictTemplates: true },
};

const stylesImport = selected.tailwind ? 'import "./styles.css";\n' : "";
const i18nImport = selected.i18n ? 'import { loadLocales } from "./i18n";\n' : "";
const i18nCall = selected.i18n ? "  loadLocales();\n" : "";
const indexTs = selected.router
  ? `${stylesImport}import { globals } from "@vc-frontend/core";
${i18nImport}import type { RouteRecordRaw } from "vue-router";

const MyPage = () => import("./pages/my-page.vue");

const route: RouteRecordRaw = { path: "/${pluginName}", name: "${pluginName}", component: MyPage };

export function init(): void {
  globals.router.addRoute(route);
${i18nCall}}
`
  : `${stylesImport}${i18nImport}export function init(): void {
${i18nCall}  // Wire your plugin here (extension points, listeners, ...) using @vc-frontend/core.
}
`;

// All of the plugin's messages live under one top-level key, so they cannot clash with the storefront's.
const messagesNamespace = pluginName.replaceAll("-", "_");
const localeMessages = {
  [messagesNamespace]: {
    title: pluginName,
    description: "Served by Module Federation - built and deployed separately from the host.",
  },
};
const i18nTs = `import { globals, registerLocaleLoader } from "@vc-frontend/core";
import type { I18n, ILanguage } from "@vc-frontend/core";

const FALLBACK_LOCALE = "en";
const LOCALE_FILES = import.meta.glob<{ default: Record<string, unknown> }>("./locales/*.json");

async function loadFile(locale: string): Promise<Record<string, unknown>> {
  const load = LOCALE_FILES[\`./locales/\${locale}.json\`];
  return load ? (await load()).default : {};
}

/**
 * Merges this plugin's messages for a locale, and the \`en\` fallback, into the storefront's i18n.
 * setLocaleMessage on a fresh object, never mergeLocaleMessage: the host's messages can be frozen.
 */
async function mergeLocale(i18n: I18n, locale: string): Promise<void> {
  const locales = locale === FALLBACK_LOCALE ? [FALLBACK_LOCALE] : [FALLBACK_LOCALE, locale];
  const messages = await Promise.all(locales.map(loadFile));
  locales.forEach((name, index) => {
    const existing = i18n.global.getLocaleMessage(name) as Record<string, unknown>;
    i18n.global.setLocaleMessage(name, { ...existing, ...messages[index] });
  });
}

/** Merges the current locale now, and again on every language switch. */
export function loadLocales(): void {
  registerLocaleLoader("plugin:${pluginName}", (i18n: I18n, language: ILanguage) =>
    mergeLocale(i18n, language?.twoLetterLanguageName || FALLBACK_LOCALE),
  );
  const { locale } = globals.i18n.global;
  // i18n holds the full culture ("en-US"); the message files are two-letter, like the host's.
  const current = typeof locale === "object" ? locale.value : locale;
  void mergeLocale(globals.i18n, current?.split("-")[0] || FALLBACK_LOCALE);
}
`;

const DOCS_URL = `https://github.com/${HOST_REPO}/blob/dev/client-app/core/federation`;
const SCENARIOS_URL = `${DOCS_URL}/scenarios`;

const moduleId = webDir ? parseModuleManifest(readFileSync(join(webDir, "module.manifest"), "utf8")).id : undefined;
const switchModule = moduleId ?? "<module id>";
const switchSetting = `${moduleId?.split(".").at(-1) ?? "<Module>"}.StorefrontPlugin.Enabled`;

const pluginConfigTs = `import { definePluginManifest } from "@vc-frontend/core/manifest";

// What the storefront knows before running this plugin. It does not replace the registrations in
// src/index.ts. Reference: ${DOCS_URL}/declarations.md
export default definePluginManifest({
  // An off switch per store, without a release: add a public store setting to the module, import settingEnabled
  // above, and uncomment. While the setting is missing or false, nothing of the plugin loads.
  // when: settingEnabled("${switchModule}", "${switchSetting}"),${
    selected.router
      ? `
  routes: [{ path: "/${pluginName}", name: "${pluginName}" }],`
      : ""
  }
});
`;

const pageClass = selected.tailwind ? ' class="p-6 text-primary-700"' : "";
const myPageVue = selected.i18n
  ? `<template>
  <div${pageClass}>
    <h1>{{ $t("${messagesNamespace}.title") }}</h1>
    <p>{{ $t("${messagesNamespace}.description") }}</p>
  </div>
</template>
`
  : `<template>
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

const optionNames = GROUPS.map((group) => `${group.key} ${selected[group.key] ? "yes" : "no"}`).join(" · ");
const successCheck = selected.router
  ? `\`https://localhost:3000/${pluginName}\` shows the plugin's page.`
  : `The browser console says \`[MF] plugins loaded=[${pluginName}]\`.`;

// The top is the author's: what the plugin does. Everything generated sits under one heading below it, so the
// two are never confused.
const readmeTitle = moduleId
  ? `# ${pluginName}: storefront plugin of ${moduleId}`
  : `# ${pluginName}: storefront plugin`;
const readmeHeader = `${readmeTitle}

<!-- What this plugin adds to the storefront: its pages and widgets, and who sees them. -->

## Working on this plugin

> Generated by \`yarn create:plugin\` (facade ${corePkg.version}). This part is about how the plugin plugs into the
> storefront, not what it does. The full docs: [the guide](${DOCS_URL}/README.md).

Built against \`@vc-frontend/core\` ${corePkg.version}; it loads in storefronts whose facade satisfies
\`^${corePkg.version}\`. Options: ${optionNames}.
`;

const readmeSections = [
  `## First run

1. 📁 here: \`yarn install\`, then \`yarn build && yarn preview\`. The plugin is served on port 3001.
2. 📁 a vc-frontend checkout, with \`"module_federation_enabled": true\` in \`client-app/config/settings_data.json\`
   (the default) and a backend in \`.env.local\` (\`APP_BACKEND_URL\`):

   \`\`\`bash
   APP_MODULES_FEDERATION_REMOTES='{"${pluginName}":"http://localhost:3001/mf-manifest.json"}' \\
   yarn build-only --mode=development && yarn preview
   \`\`\`

   PowerShell or cmd: put the \`APP_MODULES_FEDERATION_REMOTES=…\` line in that \`.env.local\` instead (take it out
   afterwards: it replaces the platform's plugin list), and run the two commands one after the other.

3. ✅ ${successCheck}

More setups (hot reload, a deployed module, an unreleased facade): [S2](${SCENARIOS_URL}/s2-develop-locally.md).

## Files

| File | What it is |
| --- | --- |
| \`src/index.ts\` | \`init()\`, called by the storefront once the plugin's code loads |
| \`plugin.config.ts\` | what the storefront knows before the code loads: routes, menu entries, slots, \`when\` |
| \`public/plugin.json\` | the plugin's id and expose key, read by the platform |
| \`vite.config.ts\` | the build, and \`requiredHostVersion\`: the facade versions this plugin claims to work with |
| \`src/mocks/vc-frontend-core.ts\` | stand-in for the facade in tests |
| \`CLAUDE.md\` | for AI agents: this README, plus what to run and never do |`,
  webDir && `| \`${TARGETS_FILE}\` | the module build: builds this plugin and puts it in the module package |`,
  selected.apollo && "| `codegen.ts`, `src/api/graphql/` | your GraphQL documents and their generated types |",
  selected.tailwind && "| `tailwind.config.cjs`, `src/styles.css` | Tailwind with the storefront's design tokens |",
  `
## Rules

1. **Host APIs come only from \`@vc-frontend/core\`.** Never \`@/…\`: those paths do not exist here.
2. **Register a declared route before the first \`await\` in \`init()\`.** A later call is refused.
3. **Give routes and menu ids names the storefront cannot already have.** A host name is refused.
4. **The backend authorizes every query.** A \`permission\` in \`plugin.json\` only decides whether a browser loads
   the plugin; its files are public by URL.
5. **\`requiredHostVersion\` is \`^\` the facade you pin.** A lower floor would claim storefronts that may lack
   what the plugin compiled against, so \`check:plugin-module\` fails it. To reach storefronts on an older facade,
   pin that facade's release instead.${
     droppedShared.length
       ? `
6. **A library set to \`false\` in \`sharedOverrides\` (vite.config.ts) is not shared.** Delete its line before you
   import it. Otherwise the plugin bundles its own copy, which does not see the storefront's router, i18n or Apollo
   client.`
       : ""
   }

## Commands

| Command | Does |
| --- | --- |
| \`yarn build\` / \`yarn watch\` | build once / on every save |
| \`yarn preview\` | serve the build on port 3001 |
| \`yarn dev\` | dev server with hot reload. It does not write \`plugin.json\`, so the storefront sees no declarations |
| \`yarn type-check\`, \`yarn lint\`, \`yarn test\` | the storefront's own checks, at its versions |`,
  selected.apollo && "| `yarn generate:graphql-types` | regenerate `src/api/graphql/types.ts` |",
  `
## Tests

The facade has no runtime code outside the storefront, so tests import a stand-in: \`vitest.config.ts\` points
\`@vc-frontend/core\` at \`src/mocks/vc-frontend-core.ts\`. Add the symbols your code uses there, and override them
in a spec with one \`vi.mock\` that spreads the original:

\`\`\`ts
vi.mock("@vc-frontend/core", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  globals: { storeId: "test-store" },
}));
\`\`\`

Mount helpers come from \`@vc-frontend/core/testing\`. In tests a \`Vc*\` component is whatever the stand-in
gives; test its own behaviour in the storefront, not here.`,
  selected.i18n &&
    `
## Translations

Messages live in \`src/locales/<two-letter locale>.json\`, all under one top-level key, \`${messagesNamespace}\`, so they
cannot clash with the storefront's. The scaffold wrote one file per storefront language, each in English:
translate them. Languages: ${HOST_LOCALES.join(", ")}.

\`src/i18n.ts\` merges them into the storefront's i18n at startup and again on every language switch. A language
without a file (one the storefront adds later, say) falls back to \`en\`. Use them as \`$t("${messagesNamespace}.…")\`;
a declared menu title in \`plugin.config.ts\` is such a key too.`,
  selected.apollo &&
    `
## GraphQL

1. Copy \`.env.example\` to \`.env\` and set \`APP_BACKEND_URL\`.
2. Write documents under \`src/api/graphql/\`, then \`yarn generate:graphql-types\`. It reads
   \`/graphql/${pluginName}\`, the schema the module registers under that name
   (\`appBuilder.UseScopedSchema<…>("${pluginName}")\` in its \`Module.cs\`). If the module extends the storefront
   schema instead, set \`schema\` in \`codegen.ts\` to \`/graphql\`.
3. Commit the generated \`types.ts\`: the build must not need a backend.`,
  `
## Styling

Plugin CSS applies to the whole storefront page: nothing fences it yet. Prefer \`<style scoped>\`, and colour with
the storefront's CSS variables (\`var(--color-…)\`), not fixed values, so dark mode and the theme presets work.`,
  selected.tailwind &&
    "\nTailwind here uses the storefront's preset and emits only components and utilities, never its base reset.",
  webDir
    ? `
## Shipping

This plugin ships inside its backend module. \`yarn build\` writes it to \`${PLUGIN_OUT_DIR}/\`, the folder the
platform serves, and the module build runs that through \`${TARGETS_FILE}\`. From a vc-frontend checkout:

\`\`\`bash
yarn check:plugin-module <path-to-the-module's-*.Web> [--artifact <module.zip>] [--env <storefront-url>]
\`\`\`

Steps: [S1a](${SCENARIOS_URL}/s1a-plugin-in-an-existing-module.md); on an environment:
[S6](${SCENARIOS_URL}/s6-enable-on-an-environment.md).`
    : `
## Shipping

Ship it inside a backend module ([S1a](${SCENARIOS_URL}/s1a-plugin-in-an-existing-module.md)): installing the
module installs the plugin, with no storefront rebuild. \`yarn create:plugin <name> --module <path>\` scaffolds
straight into one.`,
  `
## The facade dependency

\`@vc-frontend/core\` is pinned to a release tarball, and the lockfile records its checksum. **Keep it pinned in
commits.** To use an unreleased facade, link it with yalc and restore the pin before pushing
([S2.3](${SCENARIOS_URL}/s2-develop-locally.md#23-the-facade-is-extended-but-not-released)). Not \`portal:\` or
\`link:\`: they symlink, and the test helpers break.

## More

- How plugins work: [the guide](${DOCS_URL}/README.md)
- Every task, step by step: [the scenarios](${SCENARIOS_URL}/README.md)
- Not showing up? [S7](${SCENARIOS_URL}/s7-missing-or-broken.md)
`,
];
const readme = `${readmeHeader}\n${readmeSections.filter(Boolean).join("\n").replaceAll(/^## /gm, "### ")}`;

const SKILL_NAME = "`mf-new-plugin`";
const SKILL_SOURCE = "the `vc-frontend` plugin of the VirtoCommerce/ai-tools marketplace";

// Loaded by Claude Code for any work in this folder. It imports the README instead of restating it.
const claudeMd = [
  `# CLAUDE.md

A storefront plugin: a Module Federation remote that runs inside the Virto Commerce storefront (vc-frontend).
How it plugs in, its files, rules and commands: @README.md

## Before a change is done

1. \`yarn type-check\`, \`yarn lint\` and \`yarn test\` pass. Changed \`plugin.config.ts\`? \`yarn build\` too: it validates
   the declarations.`,
  webDir && `2. From a vc-frontend checkout, \`yarn check:plugin-module\` on the module passes.`,
  `
## Never

1. Import from a storefront path (\`@/…\`). A symbol the facade lacks is either added to it in vc-frontend
   ([S3](${SCENARIOS_URL}/s3-extend-the-facade.md)) or copied here, small.
2. Edit \`@vc-frontend/core\` types, or commit its pin as \`portal:\`, \`link:\` or a yalc path.`,
  selected.apollo && "3. Edit `src/api/graphql/types.ts` by hand: run `yarn generate:graphql-types`.",
  `
## Where each task is described

| Task | Doc |
| --- | --- |${
    webDir
      ? `
| Wire it into the module, before the first commit | [S1a](${SCENARIOS_URL}/s1a-plugin-in-an-existing-module.md), or the ${SKILL_NAME} skill (${SKILL_SOURCE}) |`
      : ""
  }
| Run it in a local storefront | [S2](${SCENARIOS_URL}/s2-develop-locally.md) |
| Add a route, menu entry or slot | [declarations](${DOCS_URL}/declarations.md) |
| Move to a new facade version | [S4](${SCENARIOS_URL}/s4-upgrade-a-plugin.md) |
| It does not show up, or fails | [S7](${SCENARIOS_URL}/s7-missing-or-broken.md) |
| Anything else | [the scenarios](${SCENARIOS_URL}/README.md) |
`,
]
  .filter(Boolean)
  .join("\n");

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
  // The schema the module registers under this name: appBuilder.UseScopedSchema<…>("${pluginName}")
  // in its Module.cs. A module that extends the storefront schema instead: plain \`/graphql\`.
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
  test: { environment: "jsdom", passWithNoTests: true },
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
export const useModal = () => ({ openModal: () => () => {}, closeModal: () => {} });
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
    expect(createWrapper().text()).toContain("${selected.i18n ? `${messagesNamespace}.title` : pluginName}");
  });
});
`;

// ── write ─────────────────────────────────────────────────────────────────────
// The host's supply-chain age gate, so a plugin does not install a package the host would refuse.
const hostAgeGate = /^npmMinimalAgeGate:.*$/m.exec(readFileSync(resolve(REPO_ROOT, ".yarnrc.yml"), "utf8"))?.[0];
const json = (value) => JSON.stringify(value, null, 2) + "\n";
/** Every file the scaffold creates, relative to the target. None is written while any of them exists. */
const outputs = [
  ["package.json", json(pkgJson)],
  ["index.html", indexHtml],
  ["vite.config.ts", viteConfig],
  ["plugin.config.ts", pluginConfigTs],
  ["tsconfig.json", json(tsconfig)],
  ["src/index.ts", indexTs],
  selected.router && ["src/pages/my-page.vue", myPageVue],
  selected.i18n && ["src/i18n.ts", i18nTs],
  ...(selected.i18n ? HOST_LOCALES.map((locale) => [`src/locales/${locale}.json`, json(localeMessages)]) : []),
  selected.tailwind && ["tailwind.config.cjs", tailwindConfig],
  selected.tailwind && ["postcss.config.cjs", postcssConfig],
  selected.tailwind && ["src/styles.css", stylesCss],
  ["public/plugin.json", json(pluginJson)],
  ["src/shims-vue.d.ts", shimsVue],
  ["README.md", readme],
  ["CLAUDE.md", claudeMd],
  ["eslint.config.js", eslintConfig],
  [".prettierrc.json", json(prettierRc)],
  [".prettierignore", "dist/\nnode_modules/\n.yalc/\nyarn.lock\nsrc/api/graphql/types.ts\n"],
  [".editorconfig", editorConfig],
  [".vscode/settings.json", json(vscodeSettings)],
  [".vscode/extensions.json", json(vscodeExtensions)],
  ["vitest.config.ts", vitestConfig],
  [FACADE_MOCK_PATH, facadeMock],
  selected.router && [`src/pages/${samplePage}.test.ts`, sampleSpec],
  selected.apollo && ["codegen.ts", codegenConfig],
  selected.apollo && [".env.example", envExample],
  selected.apollo && ["src/api/graphql/queries/ping/pingQuery.graphql", sampleDocument],
  webDir && [TARGETS_FILE, STOREFRONT_PLUGIN_TARGETS],
  // yalc artifacts (local facade co-dev) must never be committed - see README.
  [".gitignore", "node_modules/\ndist/\n.yarn/install-state.gz\n.yalc/\nyalc.lock\n.env\n*.local\n"],
  // An empty lockfile makes this folder its own Yarn project. Without it, Yarn refuses to install under a parent
  // package.json, which a module's *.Web often has for its admin UI.
  ["yarn.lock", ""],
  // Standalone project: keep Yarn out of the host's workspace/PnP context.
  [".yarnrc.yml", ["nodeLinker: node-modules", hostAgeGate, ""].filter((line) => line !== undefined).join("\n")],
].filter(Boolean);

const taken = outputs.map(([file]) => file).filter((file) => existsSync(join(targetDir, file)));
if (taken.length) {
  console.error(
    `${targetDir} already has ${taken.join(", ")} - refusing to overwrite. Scaffold into a folder without them.`,
  );
  process.exit(1);
}
mkdirSync(join(targetDir, "src", "pages"), { recursive: true });
for (const [file, content] of outputs) {
  mkdirSync(dirname(join(targetDir, file)), { recursive: true });
  writeFileSync(join(targetDir, file), content, { flag: "wx" });
}

if (pinnedReleaseIsMissing()) {
  console.log(
    `\n!! @vc-frontend/core ${corePkg.version} is not released yet — \`core-v${corePkg.version}\` has no tag, so the\n` +
      `   pin this scaffold wrote 404s on install. Until the "Core Facade Release" workflow publishes it,\n` +
      "   link the local facade instead (yalc copies files, so types resolve against THIS plugin's\n" +
      "   node_modules — a `portal:`/`link:` pin resolves them against the host's and breaks the\n" +
      "   @vue/test-utils helpers with a private-property mismatch):\n" +
      "     (host)   yarn core:yalc-push\n" +
      "     (plugin) npx yalc add @vc-frontend/core && yarn install\n" +
      "   Restore the pinned tarball URL before committing. If the plugin's CI or a QA environment needs the\n" +
      "   facade before its release, pin an alpha pre-release of the facade branch (core-api/README.md §5).",
  );
}

console.log(`\nScaffolded "${pluginName}" at ${targetDir}`);
console.log(`  deps pinned from host: ${runtimeDeps.join(", ")}`);
if (droppedShared.length) {
  console.log(`  dropped from MF shared (unused at runtime): ${droppedShared.join(", ")}`);
}
if (webDir) {
  const pending = checkModuleFiles(webDir).filter((result) => result.status !== "pass");
  console.log(
    `\nThe module's own files are not edited. Still to do there (yarn check:plugin-module ${shownPath(webDir)}):\n` +
      formatResults(pending) +
      `\nIn Claude Code, the ${SKILL_NAME} skill makes these edits and stops for your decisions: ${SKILL_SOURCE}.`,
  );
}
console.log(`\nNext steps:
  cd ${shownPath(targetDir)}
  yarn install
  yarn build && yarn preview   # serves mf-manifest.json on :3001

Then point the host at it (--mode=development so the store resolves from APP_BACKEND_URL, not the hostname).
The host needs module_federation_enabled: true in client-app/config/settings_data.json (the default)
and a backend in .env.local (APP_BACKEND_URL):
  APP_MODULES_FEDERATION_REMOTES='{"${pluginName}":"http://localhost:3001/mf-manifest.json"}' yarn build-only --mode=development && yarn preview
PowerShell or cmd: put the APP_MODULES_FEDERATION_REMOTES line in .env.local instead (take it out afterwards),
then run yarn build-only --mode=development and yarn preview one after the other.
`);
