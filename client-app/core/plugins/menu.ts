import { App } from "vue";
import { MenuLinkType } from "../api/graphql/types";

export default {
  install: (app: App, options: Record<string, MenuLinkType[]>) => {
    app.config.globalProperties.$menus = options;
    app.provide("menus", options);
  },
};
