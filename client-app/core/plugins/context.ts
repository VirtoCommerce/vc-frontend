import { App } from "vue";
import { IThemeContext } from "../types";
import { contextInjectionKey } from "@core/injection-keys";

export default {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$context = options;
    app.provide(contextInjectionKey, options);
  },
};
