import { App } from "vue";
import { IThemeContext } from "../types";
import { contextInjectionKey } from "@/core/constants";

export default {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$context = options;
    app.provide(contextInjectionKey, options);
  },
};
