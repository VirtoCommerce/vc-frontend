import { modulesInjectionKey } from "@/core/injection-keys";
import type { ModuleSettingsType } from "@/core/api/graphql/types";
import type { Plugin } from "vue";
import type { App } from "vue/dist/vue";

export const modulesPlugin: Plugin = {
  install: (app: App, options: ModuleSettingsType[]) => {
    app.config.globalProperties.$modules = options;
    app.provide(modulesInjectionKey, options);
  },
};
