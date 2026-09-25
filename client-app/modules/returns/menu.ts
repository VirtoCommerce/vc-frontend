import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";

export const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      purchasing: {
        children: [
          {
            id: "returns",
            route: {
              name: "Returns",
            },
            title: "returns.menu.link.title",
            icon: "receipt-refund",
            priority: 25,
          },
        ],
      },
    },
    mobile: {
      purchasing: {
        children: [
          {
            id: "returns",
            route: {
              name: "Returns",
            },
            title: "returns.menu.link.title",
            icon: "receipt-refund",
            priority: 25,
          },
        ],
      },
    },
  },
};
