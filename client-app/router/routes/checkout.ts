import { RouteRecordRaw } from "vue-router";
import Billing from "@/pages/checkout/billing.vue";
import Completed from "@/pages/checkout/completed.vue";
import Review from "@/pages/checkout/review.vue";
import Shipping from "@/pages/checkout/shipping.vue";

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
    path: "review",
    name: "Review",
    component: Review,
  },
  {
    path: "completed/:orderNumber/:orderId",
    name: "OrderCompleted",
    component: Completed,
    meta: { layout: "Main" },
    props: true,
  },
];
