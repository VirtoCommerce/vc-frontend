import type { RouteRecordRaw } from "vue-router";

const Cart = () => import("@/pages/cart.vue");

export const cartRoutes: RouteRecordRaw[] = [
  { path: "/cart", name: "Cart", component: Cart },
  {
    path: "/cart/:cartId",
    name: "CartShared",
    component: Cart,
    props: (route) => ({
      cartId: route.params.cartId,
      blocksToHide: ["quotes", "recently-browsed-products"],
      hideBreadcrumbs: true,
    }),
    meta: { layout: "Secure" },
  },
];
