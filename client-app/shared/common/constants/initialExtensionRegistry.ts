import { defineAsyncComponent } from "vue";
import type { ExtensionRegistryStateType } from "@/shared/common/types/extensionRegistry";

export const initialExtensionRegistry: ExtensionRegistryStateType = {
  headerMenu: {
    compare: {
      component: defineAsyncComponent(
        () => import("@/shared/layout/components/header/_internal/link-components/link-compare.vue"),
      ),
    },
    cart: {
      component: defineAsyncComponent(
        () => import("@/shared/layout/components/header/_internal/link-components/link-cart.vue"),
      ),
    },
  },
  mobileMenu: {
    cart: {
      component: defineAsyncComponent(
        () => import("@/shared/layout/components/header/_internal/mobile-menu/link-components/link-cart.vue"),
      ),
    },
    compare: {
      component: defineAsyncComponent(
        () => import("@/shared/layout/components/header/_internal/mobile-menu/link-components/link-compare.vue"),
      ),
    },
  },
  accountMenu: {
    orders: {
      component: defineAsyncComponent(
        () => import("@/shared/account/components/account-navigation-link-components/link-orders.vue"),
      ),
    },
    lists: {
      component: defineAsyncComponent(
        () => import("@/shared/account/components/account-navigation-link-components/link-lists.vue"),
      ),
    },
  },
  mobileHeader: {},
  productCard: {},
  productPage: {},
};
