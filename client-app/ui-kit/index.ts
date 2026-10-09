import { vOnClickOutside } from "@vueuse/components";
import { vMaska } from "maska/vue";
import VueSecureHTML from "vue-html-secure";
import * as UIKitComponents from "@/ui-kit/components";
import type { App, Plugin } from "vue";

export const uiKit: Plugin = {
  install: (app: App) => {
    // Directives
    app.directive("mask", vMaska);
    app.directive("onClickOutside", vOnClickOutside);

    // Components
    // Register UI Kit components globally
    Object.entries(UIKitComponents).forEach(([name, component]) => app.component(name, component));

    app.use(VueSecureHTML as Plugin);
  },
};
