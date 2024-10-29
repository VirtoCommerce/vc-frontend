import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordName, RouteRecordRaw } from "vue-router";

const Checkout = () => import("@/pages/checkout/index.vue");
const Billing = () => import("@/pages/checkout/billing.vue");
const Completed = () => import("@/pages/checkout/completed.vue");
const PaymentResult = () => import("@/pages/checkout/payment-result.vue");
const Payment = () => import("@/pages/checkout/payment.vue");
const Review = () => import("@/pages/checkout/review.vue");
const Shipping = () => import("@/pages/checkout/shipping.vue");

function handleBeforeEnter(
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  targetRoute: RouteRecordName,
  redirectRoute: RouteRecordName,
) {
  if (from.name === targetRoute) {
    next({ name: redirectRoute, replace: true });
  } else {
    next();
  }
}
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
    path: "/checkout/:cartId?",
    name: "Checkout",
    component: Checkout,
    props: true,
    children: [
      {
        path: "shipping",
        name: "Shipping",
        component: Shipping,
        beforeEnter(to, from, next) {
          handleBeforeEnter(from, next, "CheckoutPayment", "Cart");
        },
      },
      {
        path: "billing",
        name: "Billing",
        component: Billing,
        beforeEnter(to, from, next) {
          handleBeforeEnter(from, next, "CheckoutPayment", "Cart");
        },
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
      if (from.name === "Cart") {
        next();
      } else if (from.name === "CheckoutPaymentResult" && to.name === "CheckoutPayment") {
        next();
      } else {
        next({ name: "Cart", replace: true });
      }
    },
  },
];
