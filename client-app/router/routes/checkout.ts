import { RouteRecordRaw } from "vue-router";

const Shipping = () => import("@/pages/checkout/shipping.vue");
const Billing = () => import("@/pages/checkout/billing.vue");

/** Guard * /
const beforeEnter = (to: RouteLocationNormalized): RouteLocationRaw | boolean =>
  !!to.params.continuity || {
    name: "Cart",
    replace: true,
  };
*/

export const checkoutRoutes: RouteRecordRaw[] = [
  {
    path: "shipping",
    name: "CheckoutShipping",
    component: Shipping,
    //beforeEnter,
  },
  {
    path: "billing",
    name: "CheckoutBilling",
    component: Billing,
    //beforeEnter,
  },
];
