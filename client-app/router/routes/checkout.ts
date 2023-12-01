import type { RouteRecordRaw } from "vue-router";

const Billing = () => import("@/pages/checkout/billing.vue");
const Completed = () => import("@/pages/checkout/completed.vue");
const PaymentResult = () => import("@/pages/checkout/payment-result.vue");
const Payment = () => import("@/pages/checkout/payment.vue");
const Review = () => import("@/pages/checkout/review.vue");
const Shipping = () => import("@/pages/checkout/shipping.vue");

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
