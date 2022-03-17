import { App } from "vue";
import { IThemeContext } from "../types";

export default {
  install: (app: App, options: IThemeContext) => {
    app.config.globalProperties.$context = options;
    app.provide("context", options);
  }
}
