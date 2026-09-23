import { reservationFor } from "@/modules/federated/contributions/declare";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";
import type { ConditionParamType } from "@/shared/common/types/extensionRegistryMap";
import type { App, Plugin } from "vue";
import ExtensionPointList from "@/shared/common/components/extension-point-list.vue";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";

export const extensionPointsPlugin: Plugin = {
  install: (app: App) => {
    const { canRender } = useExtensionRegistry();

    /**
     * Checking if component should be rendered — or, while the plugin that declared this slot is on
     * the way, whether the extension point should hold its box so nothing shifts when it lands.
     * @example:
     *  <ExtensionPoint v-if="$canRenderExtensionPoint('productCard', 'card-button', product)" />
     */
    app.config.globalProperties.$canRenderExtensionPoint = <C extends ExtensionCategoryType>(
      category: C,
      name: string,
      parameter: ConditionParamType<C>,
    ) => canRender(category, name, parameter) || reservationFor(category, name, parameter) !== undefined;

    app.component("ExtensionPoint", ExtensionPoint);
    app.component("ExtensionPointList", ExtensionPointList);
  },
};
