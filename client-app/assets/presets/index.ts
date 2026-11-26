import { darkPresets as kitDarkPresets, presets as kitPresets } from "@/ui-kit/presets";
import type { IThemeConfigPreset } from "@/core/types";

// The stock presets come from ui-kit. A theme's own bundled preset is <name>.json (and <name>.dark.json), imported
// and listed below after the spread; a stock name replaces that whole preset, light and dark separately. A <name>.scss
// in this folder is not listed here: it is loaded by name (core/utilities/design) for the active preset, after
// ui-kit's <name>.scss when the stock preset has one.
export const presets: Record<string, IThemeConfigPreset> = {
  ...kitPresets,
};

export const darkPresets: Record<string, IThemeConfigPreset> = {
  ...kitDarkPresets,
};
