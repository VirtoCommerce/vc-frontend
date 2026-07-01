import path from "path";
import { federation } from "@module-federation/vite";
import graphqlImport from "@rollup/plugin-graphql";
import vue from "@vitejs/plugin-vue";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { checker } from "vite-plugin-checker";
import mkcert from "vite-plugin-mkcert";
import type { ProxyOptions, UserConfig, PluginOption } from "vite";

const graphql = graphqlImport.default ?? graphqlImport;

/**
 * Module Federation shared singletons (VCST-5159). These MUST be a single instance
 * across host and every plugin, or reactivity, routing, i18n, the Apollo cache and
 * the `createGlobalState` composables (useUser / useCart / useExtensionRegistry)
 * silently fork. `requiredVersion: "*"` (accept any version; `strictVersion` defaults
 * to false so a mismatch only warns, never blocks) decouples runtime from the
 * published `@vc-frontend/core` version so a host upgrade never forces a plugin re-release.
 *
 * NOTE: keep in sync with `examples/news-plugin/vite.config.ts`, where the same
 * list is declared with `import: false` (plugins consume, never provide).
 */
const MF_SHARED = {
  vue: { singleton: true, requiredVersion: "*" },
  "vue-router": { singleton: true, requiredVersion: "*" },
  "vue-i18n": { singleton: true, requiredVersion: "*" },
  "@vueuse/core": { singleton: true, requiredVersion: "*" },
  "@apollo/client": { singleton: true, requiredVersion: "*" },
  "@vue/apollo-composable": { singleton: true, requiredVersion: "*" },
  graphql: { singleton: true, requiredVersion: "*" },
  "@vc-frontend/core": { singleton: true, requiredVersion: "*", version: "2.53.0" },
} as const;

function getProxy(target: ProxyOptions["target"], options: Omit<ProxyOptions, "target"> = {}): ProxyOptions {
  const dontTrustSelfSignedCertificate = false;

  return {
    target,
    changeOrigin: true,
    secure: dontTrustSelfSignedCertificate,
    ...options,
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
  const isServe = command == "serve";

  // https://stackoverflow.com/a/66389044
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), "APP_"),
  };

  return {
    envPrefix: "APP_",
    publicDir: "./client-app/public",
    plugins: [
      isServe
        ? mkcert({
            force: true,
            savePath: path.resolve(__dirname, ".certificates"),
            keyFileName: "private.pem",
            certFileName: "public.pem",
          })
        : undefined,
      vue(),
      // Module Federation host (VCST-5159). Declares the shared singletons that
      // plugins bind to and emits mf-manifest.json. `remotes` are registered at
      // runtime from the InitializeApplication manifest (wired in a later phase),
      // so none are hard-coded here.
      //
      // Gated behind APP_MF_HOST so the default dev/build on this branch is
      // unchanged until host-side consumption is wired in app-runner.ts.
      process.env.APP_MF_HOST
        ? (federation({
            name: "host",
            filename: "remoteEntry.js",
            manifest: true,
            // Off: the dts plugin emits .d.ts across the shared facade's whole
            // source graph, polluting client-app. Types are a build-time concern
            // handled by a dedicated publish-from-source .d.ts build instead.
            dts: false,
            shareStrategy: "loaded-first",
            shared: MF_SHARED,
          }) as PluginOption)
        : undefined,
      graphql() as PluginOption,
      isServe
        ? checker({
            enableBuild: false,
            typescript: true,
            vueTsc: {
              tsconfigPath: path.resolve(__dirname, "tsconfig.app.json"),
            },
          })
        : undefined,
      process.env.GENERATE_BUNDLE_MAP
        ? (visualizer({
            filename: path.resolve(__dirname, "artifacts/bundle-map.html"),
            brotliSize: true,
            gzipSize: true,
            sourcemap: true,
          }) as PluginOption)
        : undefined,
    ],
    assetsInclude: ["**/*.svg"],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client-app"),
        // Host is the provider of the shared facade — it resolves to real source.
        "@vc-frontend/core": path.resolve(__dirname, "client-app/core-api"),
      },
    },
    define: {
      // https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
    },
    build: {
      target: browserslistToEsbuild(),
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
    },
    optimizeDeps: {
      exclude: ["swiper/vue", "swiper/types"],
    },
    server: {
      port: 3000,
      cors: true,
      headers: {
        "Content-Security-Policy": "frame-ancestors 'self' https://localhost:5001 https://builder.io;",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },
      proxy: {
        "^/api": getProxy(process.env.APP_BACKEND_URL),
        "^/graphql": getProxy(process.env.APP_BACKEND_URL, { ws: true }),
        "^/(connect|revoke)/token": getProxy(process.env.APP_BACKEND_URL),
        "^/cms-content": getProxy(process.env.APP_BACKEND_URL),
        "^/externalsignin": getProxy(process.env.APP_BACKEND_URL),
        "^/signin-oidc": getProxy(process.env.APP_BACKEND_URL),
        "^/signin-google": getProxy(process.env.APP_BACKEND_URL),
      },
    },
    // Mirrors server.proxy so a production build can be smoke-tested against the
    // backend via `yarn preview` (used for the MF host E2E — dev mode currently
    // can't prebundle the shared GraphQL facade under esbuild).
    preview: {
      port: 3000,
      cors: true,
      proxy: {
        "^/api": getProxy(process.env.APP_BACKEND_URL),
        "^/graphql": getProxy(process.env.APP_BACKEND_URL, { ws: true }),
        "^/(connect|revoke)/token": getProxy(process.env.APP_BACKEND_URL),
        "^/cms-content": getProxy(process.env.APP_BACKEND_URL),
        "^/externalsignin": getProxy(process.env.APP_BACKEND_URL),
        "^/signin-oidc": getProxy(process.env.APP_BACKEND_URL),
        "^/signin-google": getProxy(process.env.APP_BACKEND_URL),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
        },
      },
    },
  };
});
