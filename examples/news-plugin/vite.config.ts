import path from "path";
import { federation } from "@module-federation/vite";
import graphqlImport from "@rollup/plugin-graphql";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import type { PluginOption } from "vite";

// Interop: under Bundler resolution the default export is already callable.
const graphql = (graphqlImport as { default?: typeof graphqlImport }).default ?? graphqlImport;

/**
 * Consumer side of the shared singletons — identical package list to the host
 * (vite.config.ts › MF_SHARED) but with `import: false`, which guarantees the
 * plugin bundle carries NO copy and always binds to the host's live instance at
 * runtime. This is what lets the plugin reuse the host's Vue/router/i18n/Apollo
 * and the createGlobalState composables (useUser / useCart / useExtensionRegistry).
 */
const MF_SHARED = {
  vue: { singleton: true, requiredVersion: "*", import: false as const },
  "vue-router": { singleton: true, requiredVersion: "*", import: false as const },
  "vue-i18n": { singleton: true, requiredVersion: "*", import: false as const },
  "@vueuse/core": { singleton: true, requiredVersion: "*", import: false as const },
  "@apollo/client": { singleton: true, requiredVersion: "*", import: false as const },
  "@vue/apollo-composable": { singleton: true, requiredVersion: "*", import: false as const },
  graphql: { singleton: true, requiredVersion: "*", import: false as const },
  "@vc-frontend/core": { singleton: true, requiredVersion: "*", import: false as const },
};

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [
    // https so the (https) host can load this remote without mixed-content blocking.
    mkcert({ savePath: path.resolve(__dirname, "../../.certificates") }),
    vue(),
    // Module Federation REMOTE. Exposes the plugin contract as `./plugin`
    // (init(router, i18n)) and emits mf-manifest.json for host-side discovery.
    federation({
      name: "news",
      filename: "remoteEntry.js",
      // Declare the host contract in the manifest so the host can version-gate the
      // plugin BEFORE executing any of its code (VCST-5159, #2). `requiredHostVersion`
      // is the minimum `@vc-frontend/core` this plugin was built against.
      manifest: {
        additionalData: (data) => {
          (data.stats.metaData as Record<string, unknown>).requiredHostVersion = "2.0.0";
          return data.stats;
        },
      },
      // Off: avoids emitting .d.ts across the shared facade's host source graph.
      dts: false,
      exposes: {
        // The host↔plugin entry contract: init() wires routes/locales.
        "./plugin": path.resolve(__dirname, "src/index.ts"),
        // The news article page as a remote component. The host's SEO slug matcher
        // (pages/matcher/slug-content.vue) loadRemote()s this for news-article URLs,
        // so the host no longer statically imports it from an in-app module.
        "./news-article-page": path.resolve(__dirname, "src/pages/news-article.vue"),
      },
      shared: MF_SHARED,
    }) as PluginOption,
    graphql() as PluginOption,
  ],
  // NOTE: `@vc-frontend/core` is intentionally NOT aliased here. It is resolved as
  // an installed package (Yarn `portal:` → client-app/core-api, no publish) so MF
  // can detect its named exports, and it is shared (import:false) so the plugin
  // binds to the host's live instance at runtime instead of bundling a copy.
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
  },
  build: {
    // MF entry uses top-level await; esnext avoids the legacy-chunk transform.
    target: "esnext",
    outDir: "dist",
    minify: false,
    sourcemap: true,
  },
  // The host (localhost:3000) fetches this remote's manifest/chunks cross-origin,
  // so CORS must be open and the origin fixed for absolute asset URLs.
  server: {
    port: 3001,
    cors: true,
    origin: "http://localhost:3001",
  },
  preview: {
    port: 3001,
    cors: true,
  },
});
