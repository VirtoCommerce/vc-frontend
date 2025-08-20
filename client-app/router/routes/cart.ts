import { ROUTES } from "./constants";
import type { RouteRecordRaw } from "vue-router";

const Cart = () => import("@/pages/cart.vue");

export const cartRoutes: RouteRecordRaw[] = [
  { path: ROUTES.CART.PATH, name: ROUTES.CART.NAME, component: Cart },
  {
    path: ROUTES.CART_ID.PATH,
    name: ROUTES.CART_ID.NAME,
    component: Cart,
    props: () => ({
      blocksToHide: ["quotes", "recently-browsed-products", "cart-for-later"],
      hideControls: ["save-for-later"],
      hideBreadcrumbs: true,
    }),
    meta: { layout: "Secure" },
  },
];
