import { createRequire } from "node:module";
import { buildThemeSnapshotScript } from "./client-app/core/theme-snapshot/inline-script.js";
import { isNewPageBuilderSwitchOn } from "./client-app/core/theme-snapshot/switch.js";
import type { PluginOption } from "vite";

const require = createRequire(import.meta.url);
/** The theme's settings; the runtime reads the same key through the same predicate (client-app/core/theme-snapshot/enabled.ts). */
const themeSettings = (require("./client-app/config/settings_data.json") as { settings: Record<string, unknown> })
  .settings;

/** A page's charset has to be declared within its first 1024 bytes, so nothing long goes before it. */
const CHARSET_META_REGEX = /<meta\s+charset=[^>]*>/i;
const HEAD_START_REGEX = /<head[^>]*>/i;

export interface IThemeSnapshotPluginOptions {
  /** The domain the store is resolved by in development, where the page's host is not the store's. */
  devDomain?: string;
}

/**
 * Adds the theme snapshot request to `index.html` when the theme sets `new_page_builder_enabled: true`; otherwise
 * `index.html` stays as it is. The script comes right after the charset declaration, before every stylesheet and
 * script; `data-cfasync="false"` keeps Cloudflare Rocket Loader from deferring it.
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
        handler: (html) => {
          const script = `<script data-cfasync="false">${buildThemeSnapshotScript({ domain: options.devDomain })}</script>`;
          const anchor = CHARSET_META_REGEX.test(html) ? CHARSET_META_REGEX : HEAD_START_REGEX;

          return html.replace(anchor, (tag) => `${tag}\n    ${script}`);
        },
      },
    },
  ];
}
