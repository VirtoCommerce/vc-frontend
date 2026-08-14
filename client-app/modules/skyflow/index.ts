import { useModules, useNavigations } from "@/core/composables";
import { MODULE_ID_SKYFLOW } from "@/core/constants/modules";
import { useUser } from "@/shared/account/composables";
import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const SavedCreditCards = () => import("./pages/saved-credit-cards.vue");

const { hasModule } = useModules();
const { mergeMenuSchema } = useNavigations();

const route: RouteRecordRaw = {
  path: "saved-credit-cards",
  name: "SavedCreditCards",
  component: SavedCreditCards,
};

const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      user: {
        children: [
          {
            id: "savedCreditCards",
            route: { name: "SavedCreditCards" },
            title: "shared.account.navigation.links.saved_credit_cards",
            icon: "credit-card",
            priority: 40,
          },
        ],
      },
    },
    mobile: {
      user: {
        children: [
          {
            id: "savedCreditCards",
            route: { name: "SavedCreditCards" },
            title: "shared.layout.header.mobile.account_menu.saved_credit_cards",
            icon: "credit-card",
            priority: 40,
          },
        ],
      },
    },
  },
};

export function init(router: Router): void {
  const { isAuthenticated } = useUser();

  if (hasModule(MODULE_ID_SKYFLOW)) {
    router.addRoute("Account", route);
  }

  if (isAuthenticated.value && hasModule(MODULE_ID_SKYFLOW)) {
    mergeMenuSchema(menuItems);
  }
}
