import { configInjectionKey } from "../injection-keys";
import type { IThemeContext } from "../types";
import type { App, Plugin } from "vue";

export const configPlugin: Plugin<IThemeContext> = {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$cfg = options.settings;
    app.provide(configInjectionKey, options.settings);
  },
};
