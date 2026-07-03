/**
 * Scaffolds a new Module Federation plugin project (VCST-5159). Counterpart of
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

const CORE_API_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CORE_API_DIR, "../..");
const require = createRequire(import.meta.url);
const hostPkg = require(resolve(REPO_ROOT, "package.json"));
const corePkg = require("./package.json");

// ── input ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const positional = args.filter((arg) => !arg.startsWith("--"));
const [pluginName, targetDirArg] = positional;

if (!pluginName || !targetDirArg) {
  console.error(
    "Usage: yarn create:plugin <plugin-name> <target-dir> [--yes] [--with-i18n] [--with-apollo] [--with-vueuse] [--no-router]",
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
];

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
const portalPath = relative(targetDir, CORE_API_DIR).split("\\").join("/");

// Shared entries the plugin does NOT install must be dropped from its MF config.
const ALL_OPTIONAL_SHARED = {
  router: ["vue-router"],
  i18n: ["vue-i18n"],
  apollo: ["@apollo/client", "@vue/apollo-composable", "graphql"],
  vueuse: ["@vueuse/core"],
};
const droppedShared = Object.entries(ALL_OPTIONAL_SHARED)
  .filter(([key]) => !selected[key])
  .flatMap(([, packages]) => packages);
const droppedSharedLines = droppedShared
  .map((name) => `        "${name}": false, // not used by this plugin`)
  .join("\n");
const sharedOverrides = droppedShared.length ? `{\n${droppedSharedLines}\n      }` : "";

// ── file templates ────────────────────────────────────────────────────────────
const sortedEntries = (names) =>
  Object.fromEntries(names.sort((a, b) => a.localeCompare(b)).map((name) => [name, hostVersion(name)]));

const pkgJson = {
  name: pluginName,
  version: "1.0.0",
  private: true,
  type: "module",
  // Same Yarn as the host: the portal: protocol needs Berry (classic delegates via corepack).
  packageManager: hostPkg.packageManager,
  scripts: {
    build: "vite build",
    preview: "vite preview --port 3001",
    "type-check": "vue-tsc --noEmit",
  },
  dependencies: { "@vc-frontend/core": `portal:${portalPath}` },
  // Compile-time only: nothing below ships in the bundle (MF shared, import: false).
  devDependencies: { ...sortedEntries(runtimeDeps), ...sortedEntries(toolDeps) },
};

const viteConfig = `import { federation } from "@module-federation/vite";
import { createRemoteShared } from "@vc-frontend/core/federation";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "${pluginName}",
      filename: "remoteEntry.js",
      // The host loads exactly this: loadRemote("${pluginName}/plugin").
      exposes: { "./plugin": "./src/index.ts" },
      // Borrow the host's live singletons; never bundle copies.
      shared: createRemoteShared(${sharedOverrides}),
      // CONTRACT GATE input: the facade version this plugin is built against.
      manifest: {
        additionalData: (data) => {
          (data.stats.metaData as Record<string, unknown>).requiredHostVersion = "^${corePkg.version}";
          return data.stats;
        },
      },
      dts: false,
    }),
  ],
  build: { target: "esnext" }, // MF entry uses top-level await
  server: { port: 3001, cors: true, origin: "http://localhost:3001" },
  preview: { cors: true },
});
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

const indexTs = selected.router
  ? `import { globals } from "@vc-frontend/core";
import type { RouteRecordRaw } from "vue-router";

const MyPage = () => import("./pages/my-page.vue");

const route: RouteRecordRaw = { path: "/${pluginName}", name: "${pluginName}", component: MyPage };

export function init(): void {
  globals.router.addRoute(route);
}
`
  : `export function init(): void {
  // Wire your plugin here (extension points, listeners, ...) using @vc-frontend/core.
}
`;

const myPageVue = `<template>
  <div class="p-6">
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
`;

// ── write ─────────────────────────────────────────────────────────────────────
mkdirSync(join(targetDir, "src", "pages"), { recursive: true });
writeFileSync(join(targetDir, "package.json"), JSON.stringify(pkgJson, null, 2) + "\n");
writeFileSync(join(targetDir, "index.html"), indexHtml);
writeFileSync(join(targetDir, "vite.config.ts"), viteConfig);
writeFileSync(join(targetDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2) + "\n");
writeFileSync(join(targetDir, "src", "index.ts"), indexTs);
if (selected.router) {
  writeFileSync(join(targetDir, "src", "pages", "my-page.vue"), myPageVue);
}
writeFileSync(join(targetDir, "src", "shims-vue.d.ts"), shimsVue);
writeFileSync(join(targetDir, "README.md"), readme);
writeFileSync(join(targetDir, ".gitignore"), "node_modules/\ndist/\n");
// Standalone project: keep Yarn out of the host's workspace/PnP context.
writeFileSync(join(targetDir, ".yarnrc.yml"), "nodeLinker: node-modules\n");

console.log(`\nScaffolded "${pluginName}" at ${targetDir}`);
console.log(`  deps pinned from host: ${runtimeDeps.join(", ")}`);
if (droppedShared.length) {
  console.log(`  dropped from MF shared (not installed): ${droppedShared.join(", ")}`);
}
console.log(`\nNext steps:
  cd ${relative(process.cwd(), targetDir) || "."}
  yarn install
  yarn build && yarn preview   # serves mf-manifest.json on :3001

Then point the host at it:
  APP_MF_HOST=true APP_MF_REMOTES='{"${pluginName}":"http://localhost:3001/mf-manifest.json"}' yarn build-only && yarn preview
`);
