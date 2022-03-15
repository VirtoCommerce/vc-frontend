import { IThemeConfig, IThemeConfigPreset } from "@/core/types";

export async function initCfg(file = "/static/config/settings_data.json"): Promise<IThemeConfigPreset> {
  const cfg = (await (await fetch(file)).json()) as IThemeConfig;
  const preset = cfg.current;

  if (typeof preset === "string") {
    return cfg.presets[preset];
  } else {
    return preset;
  }
}
