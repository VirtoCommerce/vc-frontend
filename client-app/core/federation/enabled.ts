import settingsData from "@/config/settings_data.json";
import { isFederationSwitchOn } from "./switch";
import type { IThemeConfig } from "@/core/types";

/**
 * The host's single switch: `module_federation_enabled` in `settings_data.json`, next to the theme's
 * other feature toggles. The Vite build reads the same key through the same predicate
 * (vite.federation.ts) to decide whether the MF host plugin and runtime are bundled at all.
 */
export function isFederationEnabled(): boolean {
  return isFederationSwitchOn((settingsData as IThemeConfig).settings);
}
