import { useComponentsRegistry } from "@/shared/common/composables/useComponentsRegistry";
import type { App, Plugin } from "vue";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";

export const extensionPointsPlugin: Plugin = {
  install: (app: App) => {
    const { shouldRender } = useComponentsRegistry();

    /**
     * Checking if component should be rendered
     * @example:
     *  <ExtensionPoint v-if="$shouldRender('productCard', CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON, product)" />
     */
    app.config.globalProperties.$shouldRender = shouldRender;

    app.component("ExtensionPoint", ExtensionPoint);
  },
};
