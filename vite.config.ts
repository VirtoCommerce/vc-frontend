import { fileURLToPath, URL } from "node:url";
import path from "path";
import graphql from "@rollup/plugin-graphql";
import vue from "@vitejs/plugin-vue";
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
export default defineConfig(({ mode }): UserConfig => {
  const isDevelopment = mode === "development";

  // https://stackoverflow.com/a/66389044
  process.env = {
    ...process.env,
    ...loadEnv(mode, process.cwd(), "APP_"),
  };

  return {
    envPrefix: "APP_",
    base: isDevelopment ? "/" : "/themes/assets/",
    publicDir: "./client-app/public",
    plugins: [
      mkcert(),
      vue(),
      graphql(),
      isDevelopment
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
      reportCompressedSize: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          builder: path.resolve(__dirname, "builder-preview.html"),
        },
        output: {
          entryFileNames: "[name].js",
          assetFileNames: (assetInfo) => {
            // There is no way to get file path here, only name is available.
            // Only flag-icons is svg assets currently.
            if (assetInfo.name?.endsWith(".svg")) {
              return "static/icons/flag-icons/[name].svg";
            }
            return "[name][extname]";
          },
        },
      },
    },
    optimizeDeps: {
      exclude: ["swiper/vue", "swiper/types"],
    },
    server: {
      port: 3000,
      https: true,
      proxy: {
        "^/(xapi|storefrontapi)": getProxy(process.env.APP_BACKEND_URL),
        // For login on behalf
        "^/account/impersonate/.+": getProxy(process.env.APP_BACKEND_URL, {
          autoRewrite: true,
        }),
      },
    },
  };
});
