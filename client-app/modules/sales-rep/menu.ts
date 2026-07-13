import {
  MY_CUSTOMERS_NAV_LINK_ID,
  MY_CUSTOMERS_NAV_PRIORITY,
  MY_CUSTOMERS_ROUTE_NAME,
  NAV_PRIORITY,
  NAV_LINK_ID,
  ROUTE_NAME,
} from "./constants";
import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";

// Injected into the Corporate section on both desktop and mobile. The Corporate widget is
// already gated on isCorporateMember by the host, so no extra visibility guard is needed.
const link = {
  id: NAV_LINK_ID,
  title: "sales_rep.navigation.link",
  icon: "user-group",
  route: { name: ROUTE_NAME },
  priority: NAV_PRIORITY,
};

// TEMPORARY: the My customers page belongs in the future "Sales Rep Hub" left-rail widget
// (VCST-5469 left-rail task). Until that lands, expose it as a Corporate link so the page is
// reachable — remove this entry when the hub widget replaces it.
const myCustomersLink = {
  id: MY_CUSTOMERS_NAV_LINK_ID,
  title: "sales_rep.my_customers.navigation.link",
  icon: "users",
  route: { name: MY_CUSTOMERS_ROUTE_NAME },
  priority: MY_CUSTOMERS_NAV_PRIORITY,
};

export const salesRepMenuSchema: DeepPartial<MenuType> = {
  header: {
    desktop: { corporate: { children: [{ ...link }, { ...myCustomersLink }] } },
    mobile: { corporate: { children: [{ ...link }, { ...myCustomersLink }] } },
  },
};
