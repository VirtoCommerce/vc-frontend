import { configInjectionKey } from "../injection-keys";
import type { IThemeConfigPreset } from "../types";
import type { App, Plugin } from "vue";

export const configPlugin: Plugin<IThemeConfigPreset> = {
  install: (app: App, options: IThemeConfigPreset) => {
    app.config.globalProperties.$cfg = options;
    app.provide(configInjectionKey, options);

    // Set CSS variables to use as TailwindCSS arbitrary values: https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values
    const styleElement = document.createElement("style");
    styleElement.innerText = ":root {";
    Object.entries(options)
      .filter(([key]) => /^color/.test(key))
      .forEach(([key, value]) => {
        styleElement.innerText += `--${key.replace(/_/g, "-")}: ${value};`;
      });
    styleElement.innerText += "}";
    document.head.prepend(styleElement);
  },
};
