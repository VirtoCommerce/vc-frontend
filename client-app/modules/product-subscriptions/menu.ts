import { SUBSCRIPTIONS_ROUTE_NAME } from "./constants";
import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";

const subscriptionsLink = {
  id: "product-subscriptions",
  route: { name: SUBSCRIPTIONS_ROUTE_NAME },
  title: "product_subscriptions.navigation.subscriptions",
  icon: "refresh",
  priority: 25,
};

export const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      purchasing: { children: [subscriptionsLink] },
    },
    mobile: {
      purchasing: { children: [subscriptionsLink] },
    },
  },
};
