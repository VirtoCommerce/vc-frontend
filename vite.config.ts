import { fileURLToPath, URL } from "node:url";
import path from "path";
import graphql from "@rollup/plugin-graphql";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import { checker } from "vite-plugin-checker";
import mkcert from "vite-plugin-mkcert";
import type { ProxyOptions, UserConfig } from "vite";

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
    base: isServe ? "/" : "/themes/assets/",
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
      graphql(),
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
        ? visualizer({
            filename: path.resolve(__dirname, "artifacts/bundle-map.html"),
            brotliSize: true,
            gzipSize: true,
            sourcemap: true,
          })
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
      outDir: "assets",
      assetsDir: "./",
      emptyOutDir: true,
      cssCodeSplit: false,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
        output: {
          entryFileNames: "[name].js",
          assetFileNames: (assetInfo) => {
            // This code will move flag-icons svg files to separate directory during build.
            if (assetInfo.name?.endsWith(".svg")) {
              return "static/icons/flag-icons/[name].svg";
            }
            return "[name][extname]";
          },
          manualChunks: (id) => {
            // Force app-runner to have separate chunk to temporarely eliminate caveats of liquid-based hashing
            if (id.includes("app-runner")) {
              return "app-runner";
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
      proxy: {
        "^/api": getProxy(process.env.APP_BACKEND_URL),
        "^/(xapi|storefrontapi)": getProxy(process.env.APP_BACKEND_URL),
        "^/(connect|revoke)/token": getProxy(process.env.APP_BACKEND_URL),
        // For login on behalf
        "^/account/impersonate/.+": getProxy(process.env.APP_BACKEND_URL, {
          autoRewrite: true,
        }),
      },
    },
  };
});
