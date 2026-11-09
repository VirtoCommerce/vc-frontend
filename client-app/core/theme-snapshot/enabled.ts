import settingsData from "@/config/settings_data.json";
import { isNewPageBuilderSwitchOn } from "./switch";
import type { IThemeConfig } from "@/core/types";

export function isNewPageBuilderEnabled(): boolean {
  return isNewPageBuilderSwitchOn((settingsData as IThemeConfig).settings);
}
