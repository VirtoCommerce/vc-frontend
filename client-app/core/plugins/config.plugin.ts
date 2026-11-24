import { configInjectionKey } from "../injection-keys";
import { toNonEmptyString } from "../utilities/common";
import type { IThemeConfigPreset, IThemeContext } from "../types";
import type { App, Plugin } from "vue";

export const THEME_VARIABLES_ID = "vc-theme-variables";

const PALETTE_TOKEN_REGEX = /^[a-z][a-z0-9_]*$/;
const COLOR_TOKEN_PREFIX = "color_";

export function getThemeVariableName(token: string): string {
  return `--${token.replaceAll("_", "-")}`;
}

/** `--color-…` for a color token such as `primary_500` or `color_primary_500`; `undefined` for anything else. */
export function getColorTokenVariableName(token: unknown): string | undefined {
  const value = toNonEmptyString(token);

  if (!value) {
    return undefined;
  }

  const prefixedToken = value.startsWith(COLOR_TOKEN_PREFIX) ? value : `${COLOR_TOKEN_PREFIX}${value}`;

  return PALETTE_TOKEN_REGEX.test(prefixedToken) ? getThemeVariableName(prefixedToken) : undefined;
}

/** `var(--color-…)` for a color token such as `primary_500` or `color_primary_500`; `undefined` for anything else. */
export function toPaletteVariable(token: unknown): string | undefined {
  const name = getColorTokenVariableName(token);
  return name ? `var(${name})` : undefined;
}

// A theme's palette comes from the backend, so its values are set one by one and never parsed as stylesheet text.
function addPresetRule(sheet: CSSStyleSheet, selector: string, preset: IThemeConfigPreset): void {
  const rule = sheet.cssRules[sheet.insertRule(`${selector} {}`, sheet.cssRules.length)] as CSSStyleRule;

  Object.entries(preset).forEach(([key, value]) => {
    if (typeof value === "string") {
      rule.style.setProperty(getThemeVariableName(key), value);
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
