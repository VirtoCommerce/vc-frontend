import { defineAsyncComponent } from "vue";
import type { ExtensionRegistryStateType } from "@/shared/common/types/extensionRegistry";

export const initialExtensionRegistry: ExtensionRegistryStateType = {
  headerMenu: {
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
  topHeaderStatus: {},
  productCard: {},
  productPage: {},
  productActions: {},
  paymentPage: {},
  orderPaymentPage: {},
  orderDetails: {},
  cartPayment: {},
  sharedList: {},
  checkout: {},
  identityProviders: {},
  signInMethods: {},
};
