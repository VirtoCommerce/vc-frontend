import { defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const PriceHistoryPage = defineAsyncComponent(() => import("./pages/price-history-page.vue"));

const { mergeMenuSchema } = useNavigations();

const route: RouteRecordRaw = {
  path: "/price-history",
  children: [{ path: "", name: "PriceHistory", component: PriceHistoryPage }],
};

const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      account: {
        children: [
          {
            id: "price-history",
            route: { name: "PriceHistory" },
            title: "price_history.navigation.route_name",
            icon: "clipboard-arrow",
            priority: 100,
          },
        ],
      },
    },
    mobile: {
      account: {
        children: [
          {
            id: "price-history",
            route: { name: "PriceHistory" },
            title: "price_history.navigation.route_name",
            icon: "clipboard-arrow",
            priority: 100,
          },
        ],
      },
    },
  },
};

export function init(router: Router) {
  router.addRoute("PriceHistory", route);
  mergeMenuSchema(menuItems);
}
