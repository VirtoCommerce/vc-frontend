import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";

export const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      purchasing: {
        children: [
          {
            id: "purchaseRequests",
            route: {
              name: "PurchaseRequests",
            },
            title: "purchase_requests.menu.link.title",
            icon: "purchase-requests",
            priority: 50,
          },
        ],
      },
    },
    mobile: {
      account: {
        children: [
          {
            id: "purchaseRequests",
            route: {
              name: "PurchaseRequests",
            },
            title: "purchase_requests.menu.link.title",
            icon: "purchase-requests",
            priority: 100,
          },
        ],
      },
    },
  },
};
