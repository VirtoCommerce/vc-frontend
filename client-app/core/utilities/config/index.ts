import { IThemeConfig, IThemeConfigPreset } from "@/core/types";

export let cfg: IThemeConfigPreset = {};

export async function initCfg(file = "/static/config/settings_data.json"): Promise<IThemeConfigPreset> {
  const config = (await (await fetch(file)).json()) as IThemeConfig;
  const preset = config.current;

  if (typeof preset === "string") {
    cfg = config.presets[preset];
  } else {
    cfg = preset;
  }

  return cfg;
}
