import { App } from "vue";
import { IThemeConfigPreset } from "../types";

export default {
  install: (app: App, options: IThemeConfigPreset) => {
    app.config.globalProperties.$cfg = options;
    Object.entries(options).filter(([key]) => /^color/.test(key)).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key.replace(/_/g, "-")}`, value);
    });
  }
}
