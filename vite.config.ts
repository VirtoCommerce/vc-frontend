import path from "path";
import graphqlImport from "@rollup/plugin-graphql";
import vue from "@vitejs/plugin-vue";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { checker } from "vite-plugin-checker";
import mkcert from "vite-plugin-mkcert";
// Module Federation host config lives in vite.federation.ts.
import { federatedHostPlugin, federatedAlias } from "./vite.federation.js";
import type { ProxyOptions, UserConfig, PluginOption } from "vite";

const graphql = graphqlImport.default ?? graphqlImport;

// Libraries imported only via dynamic import()/defineAsyncComponent; kept out of the eager
// `vendor` chunk so they stay in their own lazy chunks. `@module-federation/*` is reached
// only through the flag-gated dynamic import in app-runner, so deferring it keeps the MF
// runtime out of the default (APP_MODULES_FEDERATION_ENABLED off) eager bundle entirely.
const DEFERRED_LIBS = ["skyflow-js", "barcode-detector", "marked", "nouislider", "@module-federation"];

function getProxy(target: ProxyOptions["target"], options: Omit<ProxyOptions, "target"> = {}): ProxyOptions {
  const dontTrustSelfSignedCertificate = false;

  return {
    target,
    changeOrigin: true,
    secure: dontTrustSelfSignedCertificate,
    ...options,
  };
}

// Builds the dev-server `Content-Security-Policy: frame-ancestors` directive. The backend host is
// environment-specific, so it comes from APP_BACKEND_URL (same source as the proxy target) instead of
// being hardcoded. builder.io is a fixed external host used by the Page Builder integration.
function getContentSecurityPolicy(): string {
  const frameAncestors = ["'self'", process.env.APP_BACKEND_URL, "https://builder.io"].filter(Boolean);
  return `frame-ancestors ${frameAncestors.join(" ")};`;
}

function getBackendProxy(): Record<string, ProxyOptions> {
  return {
    "^/api": getProxy(process.env.APP_BACKEND_URL),
    "^/graphql": getProxy(process.env.APP_BACKEND_URL, { ws: true }),
    "^/(connect|revoke)/token": getProxy(process.env.APP_BACKEND_URL),
    "^/cms-content": getProxy(process.env.APP_BACKEND_URL),
    "^/externalsignin": getProxy(process.env.APP_BACKEND_URL),
    "^/signin-oidc": getProxy(process.env.APP_BACKEND_URL),
    "^/signin-google": getProxy(process.env.APP_BACKEND_URL),
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
      // Module Federation host — empty unless APP_MODULES_FEDERATION_ENABLED is set (see vite.federation.ts).
      ...federatedHostPlugin(process.env.APP_MODULES_FEDERATION_ENABLED),
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
        // Host provides the shared facade — resolves @vc-frontend/core to real source.
        ...federatedAlias(__dirname),
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
          manualChunks(id = "") {
            if (!id.includes("node_modules")) {
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
        "Content-Security-Policy": getContentSecurityPolicy(),
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },
      proxy: getBackendProxy(),
    },
    // Mirrors server.proxy so a production build can be smoke-tested against the backend
    // via `yarn preview` — the canonical way to run the MF host locally. (`yarn dev` also
    // works, incl. HMR for plugins that share @apollo/client — see
    // client-app/modules/federated/HOWTO.md "The dev inner loop".)
    preview: {
      port: 3000,
      cors: true,
      proxy: getBackendProxy(),
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
