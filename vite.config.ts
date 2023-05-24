import path from "path";
import { defineConfig, loadEnv, ProxyOptions, splitVendorChunkPlugin, UserConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import vue from "@vitejs/plugin-vue";
import graphql from "@rollup/plugin-graphql";
import checker from "vite-plugin-checker";

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
      checker({
        enableBuild: false,
        typescript: true,
        vueTsc: true,
        eslint: {
          lintCommand: 'eslint "client-app/**/*.{js,ts,vue}" --cache --cache-location node_modules/.cache/.eslintcache',
          dev: {
            logLevel: ["error"],
          },
        },
      }),
      splitVendorChunkPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client-app"),
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
          assetFileNames: "[name][extname]",
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
