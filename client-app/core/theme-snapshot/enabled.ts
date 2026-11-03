import settingsData from "@/config/settings_data.json";
import { isNewPageBuilderSwitchOn } from "./switch";
import type { IThemeConfig } from "@/core/types";

/**
 * Whether the storefront reads the store's Page Builder theme: `new_page_builder_enabled` in `settings_data.json`.
 * The build reads the same key (vite.page-builder.ts) to decide whether `index.html` requests the theme snapshot.
 */
export function isNewPageBuilderEnabled(): boolean {
  return isNewPageBuilderSwitchOn((settingsData as IThemeConfig).settings);
}
