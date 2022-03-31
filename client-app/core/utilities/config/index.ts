import { IThemeConfig, IThemeConfigPreset } from "@/core/types";

export let cfg: IThemeConfigPreset = {};

export async function initCfg(): Promise<IThemeConfigPreset> {
  const isProd = process.env.NODE_ENV === "production";
  const file = isProd ? "/themes/settings.json" : "/config.json";
  if (isProd) {
    cfg = (await (await fetch(file)).json()) as IThemeConfigPreset;
  } else {
    const config = (await (await fetch(file)).json()) as IThemeConfig;
    const preset = config.current;

    if (typeof preset === "string") {
      cfg = config.presets[preset];
    } else {
      cfg = preset;
    }
  }

  return cfg;
}
