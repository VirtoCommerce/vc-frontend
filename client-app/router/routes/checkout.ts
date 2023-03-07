import { RouteRecordRaw } from "vue-router";
import Billing from "@/pages/checkout/billing.vue";
import Completed from "@/pages/checkout/completed.vue";
import PaymentResult from "@/pages/checkout/payment-result.vue";
import Payment from "@/pages/checkout/payment.vue";
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
    path: "payment",
    children: [
      {
        path: "",
        name: "CheckoutPayment",
        component: Payment,
      },
      {
        path: ":status(success|failure)",
        name: "CheckoutPaymentResult",
        component: PaymentResult,
        props: true,
        meta: { layout: "Main" },
      },
    ],
  },
  {
    path: "completed",
    name: "CheckoutCompleted",
    component: Completed,
    meta: { layout: "Main" },
  },
];
