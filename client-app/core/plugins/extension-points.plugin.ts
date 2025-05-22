import { useExtensionRegistry } from "@/shared/common/composables/useExtensionRegistry";
import type { App, Plugin } from "vue";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";

export const extensionPointsPlugin: Plugin = {
  install: (app: App) => {
    const { canRender } = useExtensionRegistry();

    /**
     * Checking if component should be rendered
     * @example:
     *  <ExtensionPoint v-if="$canRenderExtensionPoint('productCard', CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON, product)" />
     */
    app.config.globalProperties.$canRenderExtensionPoint = canRender;

    app.component("ExtensionPoint", ExtensionPoint);
  },
};
