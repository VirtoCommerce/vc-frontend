import { IThemeConfig, IThemeConfigPreset } from "@/core/types";

export async function initCfg(file: string = "/static/config/settings_data.json"): Promise<IThemeConfigPreset> {
  console.log("Config init start");
  const cfg = await (await fetch(file)).json() as IThemeConfig;

  const preset = cfg.current;
  console.log("Config init end");
  return cfg.presets[preset];
}
