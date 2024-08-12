import { fileURLToPath, URL } from "node:url";
import path from "path";
import graphql from "@rollup/plugin-graphql";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import { checker } from "vite-plugin-checker";
import mkcert from "vite-plugin-mkcert";
import type { ProxyOptions, UserConfig, PluginOption } from "vite";

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
      graphql() as PluginOption,
      isServe
        ? checker({
            enableBuild: false,
            typescript: true,
            vueTsc: {
              tsconfigPath: path.resolve(__dirname, "tsconfig.app.json"),
            },
            eslint: {
              lintCommand: "eslint client-app",
              dev: {
                overrideConfig: {
                  cache: true,
                  cacheLocation: "node_modules/.cache/.eslintcache",
                  cwd: process.cwd(),
                  extensions: ["js", "ts", "vue"],
                  ignore: true,
                  ignorePath: ".eslintignore",
                  useEslintrc: true,
                },
                logLevel: ["error"],
              },
            },
          })
        : undefined,
      splitVendorChunkPlugin(),
      process.env.GENERATE_BUNDLE_MAP
        ? (visualizer({
            filename: path.resolve(__dirname, "artifacts/bundle-map.html"),
            brotliSize: true,
            gzipSize: true,
            sourcemap: true,
          }) as PluginOption)
        : undefined,
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./client-app", import.meta.url)),
      },
    },
    define: {
      // https://vue-i18n.intlify.dev/guide/advanced/optimization.html#reduce-bundle-size-with-feature-build-flags
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
    },
    build: {
      emptyOutDir: true,
      sourcemap: true,
    },
    optimizeDeps: {
      exclude: ["swiper/vue", "swiper/types"],
    },
    server: {
      port: 3000,
      proxy: {
        "^/api": getProxy(process.env.APP_BACKEND_URL),
        "^/graphql": getProxy(process.env.APP_BACKEND_URL, { ws: true }),
        "^/(connect|revoke)/token": getProxy(process.env.APP_BACKEND_URL),
        "^/cms-content": getProxy(process.env.APP_BACKEND_URL),
        "^/externalsignin": getProxy(process.env.APP_BACKEND_URL),
        "^/signin-oidc": getProxy(process.env.APP_BACKEND_URL),
      },
    },
  };
});
