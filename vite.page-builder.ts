import { createRequire } from "node:module";
import { buildThemeSnapshotScript } from "./client-app/core/theme-snapshot/inline-script.js";
import { isNewPageBuilderSwitchOn } from "./client-app/core/theme-snapshot/switch.js";
import type { PluginOption } from "vite";

const require = createRequire(import.meta.url);
/** The theme's settings; the runtime reads the same key through the same predicate (client-app/core/theme-snapshot/enabled.ts). */
const themeSettings = (require("./client-app/config/settings_data.json") as { settings: Record<string, unknown> })
  .settings;

export interface IThemeSnapshotPluginOptions {
  /** The domain the store is resolved by in development, where the page's host is not the store's. */
  devDomain?: string;
}

/**
 * Adds the theme snapshot request to `index.html` when the theme sets `new_page_builder_enabled: true`; otherwise
 * `index.html` stays as it is. `data-cfasync="false"` keeps Cloudflare Rocket Loader from deferring the script.
 */
export function themeSnapshotPlugin(
  options: IThemeSnapshotPluginOptions = {},
  settings: Record<string, unknown> = themeSettings,
): PluginOption[] {
  if (!isNewPageBuilderSwitchOn(settings)) {
    return [];
  }

  return [
    {
      name: "vc-theme-snapshot",
      transformIndexHtml: {
        order: "pre",
        handler: () => [
          {
            tag: "script",
            attrs: { "data-cfasync": "false" },
            children: buildThemeSnapshotScript({ domain: options.devDomain }),
            injectTo: "head-prepend",
          },
        ],
      },
    },
  ];
}
