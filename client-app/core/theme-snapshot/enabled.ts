import settingsData from "@/config/settings_data.json";
import { isSiteBuilderSwitchOn } from "./switch";
import type { IThemeConfig } from "@/core/types";

export function isSiteBuilderEnabled(): boolean {
  return isSiteBuilderSwitchOn((settingsData as IThemeConfig).settings);
}
