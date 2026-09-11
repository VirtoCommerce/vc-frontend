import settingsData from "@/config/settings_data.json";
import type { IThemeConfig } from "@/core/types";

/**
 * The host's single switch: `module_federation_enabled` in `settings_data.json`, next to the theme's
 * other feature toggles. The Vite build reads the same key (vite.federation.ts) to decide whether the MF
 * host plugin and runtime are bundled at all. A missing key counts as enabled, so a fork that predates
 * the key still loads plugins.
 */
export function isFederationEnabled(): boolean {
  return (settingsData as IThemeConfig).settings.module_federation_enabled !== false;
}
