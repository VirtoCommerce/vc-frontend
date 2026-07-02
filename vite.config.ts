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

// Libraries imported only via dynamic import()/defineAsyncComponent; kept out of the eager
// `vendor` chunk so they stay in their own lazy chunks.
const DEFERRED_LIBS = ["skyflow-js", "barcode-detector", "marked", "nouislider"];

/**
 * Module Federation shared singletons (VCST-5159).
 *
 * INTENTIONALLY MINIMAL (#6): a package belongs here only if a second instance would
 * break correctness. Sharing pins the version host-wide — plugins bind to the host's
 * copy — so anything that does NOT strictly require a single instance is left OUT and
 * bundled per-plugin instead, preserving independent versioning. Each entry's reason:
 *   - vue / vue-router / vue-i18n : one framework instance (reactivity, the router the
 *     app navigates, the i18n messages are merged into) — two copies = broken inject.
 *   - @vueuse/core               : `createGlobalState` backs the shared state /
 *     extension registry; a second copy = a second, empty global state.
 *   - @apollo/client + @vue/apollo-composable + graphql : one client/cache/injection,
 *     and Apollo requires a single `graphql` (DocumentNodes from another copy throw).
 *   - @vc-frontend/core          : the host provides the live facade instance.
 *
 * `requiredVersion: "*"` keeps MF itself from blocking; real compatibility is enforced
 * explicitly by the loader's version gate (see client-app/modules/federated, #2).
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
      // plugins bind to and emits mf-manifest.json. Remotes are registered at
      // runtime by the loader (client-app/modules/federated) from APP_MF_REMOTES,
      // so none are hard-coded here. Gated behind APP_MF_HOST so the default
      // dev/build is unchanged unless a host opts into acting as an MF host.
      process.env.APP_MF_HOST
        ? (federation({
            name: "host",
            filename: "remoteEntry.js",
            manifest: true,
            // Off: the dts plugin would emit .d.ts across the shared facade's whole
            // source graph. Types are produced by the dedicated publish-from-source
            // build instead (yarn build:core-types → core-api/dist/index.d.ts).
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
            if (!id?.includes("node_modules")) {
              return;
            }
            const isDeferredLib = DEFERRED_LIBS.some((lib) => id.includes(`/node_modules/${lib}/`));
            if (isDeferredLib) {
              return;
            }
            // Everything else goes to a single shared eager `vendor` chunk.
            return "vendor";
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
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
        },
      },
    },
  };
});
