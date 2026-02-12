import { darkPresets } from "@/assets/presets";
import { configInjectionKey } from "../injection-keys";
import type { IThemeConfigPreset, IThemeContext } from "../types";
import type { App, Plugin } from "vue";

function presetToCssVars(preset: IThemeConfigPreset): string {
  return Object.entries(preset)
    .map(([key, value]) => `--${key.replace(/_/g, "-")}: ${value};`)
    .join("");
}

function presetNameToFileName(name: string): string {
  return name.toLowerCase().replace(" ", "-");
}

export const configPlugin: Plugin<IThemeContext> = {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$cfg = options.settings;
    app.provide(configInjectionKey, options.settings);

    if (options.preset) {
      const styleElement = document.createElement("style");
      styleElement.id = "vc-theme-variables";

      // Light mode variables (default)
      let css = `:root { ${presetToCssVars(options.preset)} }`;

      // Dark mode variables
      const presetName = presetNameToFileName(options.defaultPresetName || "default");
      const darkPreset = darkPresets[presetName];
      if (darkPreset) {
        css += ` html.dark { ${presetToCssVars(darkPreset)} }`;
      }

      styleElement.innerText = css;
      document.head.prepend(styleElement);
    }
  },
};
