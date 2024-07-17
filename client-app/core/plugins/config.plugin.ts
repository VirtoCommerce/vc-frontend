import { configInjectionKey } from "../injection-keys";
import type { IThemeContext } from "../types";
import type { App, Plugin } from "vue";

export const configPlugin: Plugin<IThemeContext> = {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$cfg = options.settings;
    app.provide(configInjectionKey, options.settings);

    // Set CSS variables to use as TailwindCSS arbitrary values: https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values
    const styleElement = document.createElement("style");
    styleElement.innerText = ":root {";
    Object.entries(options.preset).forEach(([key, value]) => {
      styleElement.innerText += `--${key.replace(/_/g, "-")}: ${value};`;
    });
    styleElement.innerText += "}";
    document.head.prepend(styleElement);
  },
};
