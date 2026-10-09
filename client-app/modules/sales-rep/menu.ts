import { NAV_PRIORITY, NAV_LINK_ID, ROUTE_NAME } from "./constants";
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

export const salesRepMenuSchema: DeepPartial<MenuType> = {
  header: {
    desktop: { corporate: { children: [{ ...link }] } },
    mobile: { corporate: { children: [{ ...link }] } },
  },
};
