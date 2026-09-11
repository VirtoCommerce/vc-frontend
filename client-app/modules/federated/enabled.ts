import settingsData from "@/config/settings_data.json";
import { isMfFlagEnabled } from "@/core-api/federation.mjs";
import type { IThemeConfig } from "@/core/types";

/**
 * The two gates of the federation host. `APP_MODULES_FEDERATION_ENABLED` decides at build time whether
 * the MF runtime is bundled at all; `module_federation_enabled` in `settings_data.json` lets a theme
 * built with it keep plugin loading off, next to its other feature toggles. A missing key counts as
 * enabled, so a fork that predates the key still loads plugins.
 */
export function isFederationEnabled(): boolean {
  return (
    isMfFlagEnabled(import.meta.env.APP_MODULES_FEDERATION_ENABLED) &&
    (settingsData as IThemeConfig).settings.module_federation_enabled !== false
  );
}
