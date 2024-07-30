import type { RouteRecordRaw } from "vue-router";

const Checkout = () => import("@/pages/checkout/index.vue");
const Billing = () => import("@/pages/checkout/billing.vue");
const Completed = () => import("@/pages/checkout/completed.vue");
const PaymentResult = () => import("@/pages/checkout/payment-result.vue");
const Payment = () => import("@/pages/checkout/payment.vue");
const Review = () => import("@/pages/checkout/review.vue");
const Shipping = () => import("@/pages/checkout/shipping.vue");

export const checkoutRoutes: RouteRecordRaw[] = [
  {
    path: "/checkout/completed",
    name: "CheckoutCompleted",
    component: Completed,
  },
  {
    path: "/checkout/payment/:status(success|failure)",
    name: "CheckoutPaymentResult",
    component: PaymentResult,
    props: true,
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: Checkout,
    children: [
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
        name: "CheckoutPayment",
        component: Payment,
      },
    ],
    meta: { layout: "Secure" },
    beforeEnter(to, from, next) {
      if (from.name === "PurchaseRequest") {
        next();
      } else if (from.name === "Cart") {
        next();
      } else if (from.name === "CheckoutPaymentResult" && to.name === "CheckoutPayment") {
        next();
      } else {
        next({ name: "Cart", replace: true });
      }
    },
  },
];
