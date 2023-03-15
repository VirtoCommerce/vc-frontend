import { contextInjectionKey } from "../injection-keys";
import type { IThemeContext } from "../types";
import type { App, Plugin } from "vue";

export const contextPlugin: Plugin<IThemeContext> = {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$context = options;
    app.provide(contextInjectionKey, options);
  },
};
