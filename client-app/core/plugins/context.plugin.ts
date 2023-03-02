import { App, Plugin } from "vue";
import { contextInjectionKey } from "../constants";
import type { IThemeContext } from "../types";

export const contextPlugin: Plugin<IThemeContext> = {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$context = options;
    app.provide(contextInjectionKey, options);
  },
};
