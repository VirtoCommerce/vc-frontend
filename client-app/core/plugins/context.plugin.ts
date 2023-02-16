import { App } from "vue";
import { contextInjectionKey } from "@/core/constants";
import { IThemeContext } from "../types";

export default {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$context = options;
    app.provide(contextInjectionKey, options);
  },
};
