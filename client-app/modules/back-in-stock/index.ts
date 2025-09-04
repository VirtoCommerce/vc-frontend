import { defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables";
import { useCustomProductComponents } from "@/shared/common/composables";
import { CUSTOM_PRODUCT_COMPONENT_IDS } from "@/shared/common/constants";
import { loadModuleLocale } from "../utils";
import { MODULE_ID, ENABLED_KEY } from "./constants";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

// By using () => import('./MyPage.vue'), you ensure that Vue Router can handle the component as a lazy-loaded route, which is the intended usage pattern.
const Subscriptions = () => import("./pages/subscriptions.vue");
const BackInStockButton = defineAsyncComponent(() => import("./components/back-in-stock-notify-button.vue"));

const { isEnabled } = useModuleSettings(MODULE_ID);
const { mergeMenuSchema } = useNavigations();
const { registerComponent } = useCustomProductComponents();

const route: RouteRecordRaw = {
  path: "back-in-stock",
  name: "BackInStockSubscriptions",
  component: Subscriptions,
};

const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      account: {
        children: [
          {
            id: "back-in-stock",
            route: { name: "BackInStockSubscriptions" },
            title: "back_in_stock.navigation.route_name",
            icon: "cube",
            priority: 100,
          },
        ],
      },
    },
    mobile: {
      account: {
        children: [
          {
            id: "back-in-stock",
            route: { name: "BackInStockSubscriptions" },
            title: "back_in_stock.navigation.route_name",
            icon: "cube",
            priority: 100,
          },
        ],
      },
    },
  },
};

export function init(router: Router, i18n: I18n) {
  const { isAuthenticated } = useUser();
  if (isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    void loadModuleLocale(i18n, "back-in-stock");
  }
  if (isAuthenticated.value && isEnabled(ENABLED_KEY)) {
    mergeMenuSchema(menuItems);
    registerComponent({
      id: CUSTOM_PRODUCT_COMPONENT_IDS.CARD_BUTTON,
      component: BackInStockButton,
      shouldRender: (product, options) =>
        !product.availabilityData.isInStock && (options?.forceProductAsVariation === true || !product.hasVariations),
    });
    registerComponent({
      id: CUSTOM_PRODUCT_COMPONENT_IDS.PAGE_SIDEBAR_BUTTON,
      component: BackInStockButton,
      shouldRender: (product) => !product.availabilityData.isInStock && !product.hasVariations,
    });
  }
}
