import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { App, Plugin } from "vue";
import ExtensionPointList from "@/shared/common/components/extension-point-list.vue";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";

export const extensionPointsPlugin: Plugin = {
  install: (app: App) => {
    const { canRender } = useExtensionRegistry();

    /**
     * Checking if component should be rendered
     * @example:
     *  <ExtensionPoint v-if="$canRenderExtensionPoint('productCard', 'card-button', product)" />
     */
    app.config.globalProperties.$canRenderExtensionPoint = canRender;

    app.component("ExtensionPoint", ExtensionPoint);
    app.component("ExtensionPointList", ExtensionPointList);
  },
};
