import { defineAsyncComponent } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { loadModuleLocale } from "@/modules/utils";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { ENABLED_KEY, MODULE_ID, PRODUCT_REVIEWS_SECTION_TYPE } from "./constants";
import type { I18n } from "@/i18n";

const { isEnabled } = useModuleSettings(MODULE_ID);

export function init(i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    void loadModuleLocale(i18n, "customer-reviews");

    useExtensionRegistry().register("pageBuilderSection", PRODUCT_REVIEWS_SECTION_TYPE, {
      component: defineAsyncComponent(() => import("./components/product-reviews-section.vue")),
    });
  }
}
