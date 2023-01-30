import { RouteRecordRaw } from "vue-router";
import Shipping from "@/pages/checkout/shipping.vue";
import Billing from "@/pages/checkout/billing.vue";
import Completed from "@/pages/checkout/completed.vue";

export const checkoutRoutes: RouteRecordRaw[] = [
  {
    path: "shipping",
    name: "Shipping",
    component: Shipping,
  },
  {
    path: "billing",
    name: "Billing",
    component: Billing,
  },
  {
    path: "completed/:orderNumber/:orderId",
    name: "OrderCompleted",
    component: Completed,
    meta: { layout: "Main" },
    props: true,
  },
];
