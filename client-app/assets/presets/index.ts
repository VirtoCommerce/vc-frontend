import { darkPresets as kitDarkPresets, presets as kitPresets } from "@/ui-kit/presets";
import type { IThemeConfigPreset } from "@/core/types";

// The stock presets come from ui-kit. A theme's own bundled preset goes in this folder: <name>.json, an optional
// <name>.dark.json and <name>.scss, imported and listed here after the stock ones; the same name replaces a stock preset.
export const presets: Record<string, IThemeConfigPreset> = {
  ...kitPresets,
};

export const darkPresets: Record<string, IThemeConfigPreset> = {
  ...kitDarkPresets,
};
