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
import { MF_SHARED_RANGES } from "./federation.mjs";

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
const toolDeps = ["typescript", "vite", "@vitejs/plugin-vue", "@module-federation/vite", "vue-tsc"];
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
  scripts: {
    build: "vite build",
    // Auto-rebuild dist/ on save; pair with `preview` for a build+reload loop.
    watch: "vite build --watch",
    preview: "vite preview --port 3001",
    // HMR remote: run the plugin as its own dev server so edits hot-update live inside
    // a host that is itself running `yarn dev` (see HOWTO "Dev inner loop").
    dev: "vite --port 3001",
    "type-check": "vue-tsc --noEmit",
  },
  dependencies: { "@vc-frontend/core": coreTarballUrl },
  // Compile-time only — nothing here ships in the bundle: packages the plugin imports are
  // MF-shared (import: false, borrowed from the host at runtime); the rest are type-peers
  // and tooling, tree-shaken away. `typePeerNames` ensures every facade type-peer is present
  // even when its optional runtime group wasn't selected (see the note at the top of file).
  devDependencies: mergeDeps(sortedEntries(runtimeDeps), sortedEntries(toolDeps), sortedEntries(typePeerNames)),
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
        // CONTRACT GATE: the facade version this plugin is built against.
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
- Full walkthrough (running against the host, shipping, versioning):
  the host repo's \`client-app/modules/federated/HOWTO.md\`.

## The facade dependency

\`@vc-frontend/core\` is pinned to a versioned tarball URL (a Release asset of the host
repo) - the lockfile records its checksum. **Keep it that way in commits.** For local
co-development against an unpushed facade, use yalc (\`yalc add @vc-frontend/core\`);
run \`yalc remove @vc-frontend/core\` and restore the pinned URL before pushing - never
commit a \`file:.yalc/...\` dependency.
`;

// Platform discovery descriptor. Without it AppManifestService assumes its own defaults —
// remote name = the .NET module id and expose "./Module" — and the host would loadRemote a key this
// plugin does not export. Vite copies `public/` into `dist/`, next to remoteEntry.js.
const pluginJson = {
  id: pluginName,
  remote: { name: pluginName, exposed: "./plugin" },
};

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
// yalc artifacts (local facade co-dev) must never be committed - see README.
writeFileSync(join(targetDir, ".gitignore"), "node_modules/\ndist/\n.yalc/\nyalc.lock\n");
// Standalone project: keep Yarn out of the host's workspace/PnP context.
writeFileSync(join(targetDir, ".yarnrc.yml"), "nodeLinker: node-modules\n");

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
