import { configInjectionKey } from "../injection-keys";
import type { IThemeConfigPreset, IThemeContext } from "../types";
import type { App, Plugin } from "vue";

const THEME_VARIABLES_ID = "vc-theme-variables";

function presetToCssVars(preset: IThemeConfigPreset): string {
  return Object.entries(preset)
    .map(([key, value]) => `--${key.replaceAll("_", "-")}: ${value};`)
    .join("");
}

/**
 * Writes the palette into `<style id="vc-theme-variables">`: with a dark variant each part is scoped to its mode,
 * without one the light part applies unconditionally. A later call replaces what an earlier one wrote.
 */
export function writeThemeVariables(preset: IThemeConfigPreset, darkPreset?: IThemeConfigPreset): void {
  let styleElement = document.getElementById(THEME_VARIABLES_ID);

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = THEME_VARIABLES_ID;
    document.head.prepend(styleElement);
  }

  styleElement.textContent = darkPreset
    ? `:root:not(.dark) { ${presetToCssVars(preset)} } html.dark { ${presetToCssVars(darkPreset)} }`
    : `:root { ${presetToCssVars(preset)} }`;
}

export const configPlugin: Plugin<IThemeContext> = {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$cfg = options.settings;
    app.provide(configInjectionKey, options.settings);

    if (options.preset) {
      writeThemeVariables(options.preset, options.darkPreset);
    }
  },
};
