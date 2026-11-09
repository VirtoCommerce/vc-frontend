import { configInjectionKey } from "../injection-keys";
import type { IThemeConfigPreset, IThemeContext } from "../types";
import type { App, Plugin } from "vue";

export const THEME_VARIABLES_ID = "vc-theme-variables";

// A theme's palette comes from the backend, so its values are set one by one and never parsed as stylesheet text.
function addPresetRule(sheet: CSSStyleSheet, selector: string, preset: IThemeConfigPreset): void {
  const rule = sheet.cssRules[sheet.insertRule(`${selector} {}`, sheet.cssRules.length)] as CSSStyleRule;

  Object.entries(preset).forEach(([key, value]) => {
    if (typeof value === "string") {
      rule.style.setProperty(`--${key.replaceAll("_", "-")}`, value);
    }
  });
}

export function writeThemeVariables(preset: IThemeConfigPreset, darkPreset?: IThemeConfigPreset): void {
  let styleElement = document.getElementById(THEME_VARIABLES_ID) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = THEME_VARIABLES_ID;
    document.head.prepend(styleElement);
  }

  const { sheet } = styleElement;

  if (!sheet) {
    return;
  }

  while (sheet.cssRules.length) {
    sheet.deleteRule(0);
  }

  if (darkPreset) {
    addPresetRule(sheet, ":root:not(.dark)", preset);
    addPresetRule(sheet, "html.dark", darkPreset);
  } else {
    addPresetRule(sheet, ":root", preset);
  }
}

export function getThemeVariablesCss(): string {
  const styleElement = document.getElementById(THEME_VARIABLES_ID) as HTMLStyleElement | null;

  return Array.from(styleElement?.sheet?.cssRules ?? [], (rule) => rule.cssText).join("\n");
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
