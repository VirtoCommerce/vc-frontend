import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";

export const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      account: {
        children: [
          {
            id: "purchaseRequests",
            route: {
              name: "PurchaseRequests",
            },
            title: "purchase_requests.menu.link.title",
            icon: "cloud-upload",
            priority: 100,
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
            icon: "cloud-upload",
            priority: 100,
          },
        ],
      },
    },
  },
};
