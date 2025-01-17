import { defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID, ENABLED_KEY } from "@/modules/quotes/constants";
import { useCustomProductCardComponents } from "@/shared/catalog/composables";
import { loadModuleLocale } from "../utils";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const Subscriptions = () => import("./pages/subscriptions.vue");
const BackInStockButton = defineAsyncComponent(() => import("./components/back-in-stock-notify-button.vue"));

const { isEnabled } = useModuleSettings(MODULE_ID);
const { mergeMenuSchema } = useNavigations();
const { registerCustomProductCardComponent } = useCustomProductCardComponents();
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
  if (isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    mergeMenuSchema(menuItems);
    void loadModuleLocale(i18n, "back-in-stock");
    registerCustomProductCardComponent({
      id: "button",
      component: BackInStockButton,
      shouldRender: (product) => !product.availabilityData.isInStock,
    });
  }
}
