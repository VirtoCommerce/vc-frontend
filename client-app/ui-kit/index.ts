import { vOnClickOutside } from "@vueuse/components";
import { vMaska } from "maska/vue";
import VueSecureHTML from "vue-html-secure";
import * as UIKitComponents from "@/ui-kit/components";
import { uiKitOptionsKey } from "@/ui-kit/composables/useUiKitOptions";
import { POPOVER_HOST_ID } from "@/ui-kit/constants";
import type { IUiKitOptions } from "@/ui-kit/composables/useUiKitOptions";
import type { App, Plugin } from "vue";

function addPopoverHost(): void {
  if (typeof document === "undefined" || document.getElementById(POPOVER_HOST_ID)) {
    return;
  }

  const host = document.createElement("div");
  host.id = POPOVER_HOST_ID;
  document.body.append(host);
}

export const uiKit: Plugin<[IUiKitOptions?]> = {
  install: (app: App, options: IUiKitOptions = {}) => {
    app.provide(uiKitOptionsKey, options);

    // Directives
    app.directive("mask", vMaska);
    app.directive("onClickOutside", vOnClickOutside);

    // Components
    // Register UI Kit components globally
    Object.entries(UIKitComponents).forEach(([name, component]) => app.component(name, component));

    app.use(VueSecureHTML as Plugin);

    addPopoverHost();
  },
};
