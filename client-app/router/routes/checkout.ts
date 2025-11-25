import { ROUTES } from "./constants";
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
    meta: { redirectable: false },
  },
  {
    path: "/checkout/payment/:status(success|failure)",
    name: "CheckoutPaymentResult",
    component: PaymentResult,
    props: true,
    meta: { redirectable: false },
  },
  {
    path: "/checkout/:cartId?",
    name: "Checkout",
    component: Checkout,
    children: [
      {
        path: "shipping",
        name: "Shipping",
        component: Shipping,
        beforeEnter(to, from, next) {
          handleBeforeEnter(from, next, "CheckoutPayment", to.params.cartId ? ROUTES.CART_ID.NAME : ROUTES.CART.NAME);
        },
      },
      {
        path: "billing",
        name: "Billing",
        component: Billing,
        beforeEnter(to, from, next) {
          handleBeforeEnter(from, next, "CheckoutPayment", to.params.cartId ? ROUTES.CART_ID.NAME : ROUTES.CART.NAME);
        },
      },
      {
        path: "review",
        name: "Review",
        component: Review,
        props: (route) => ({ cartId: route.params.cartId }),
      },
      {
        path: "payment",
        name: "CheckoutPayment",
        component: Payment,
        props: (route) => ({ cartId: route.params.cartId }),
      },
    ],
    meta: { layout: "Secure", redirectable: false },
    beforeEnter(to, from, next) {
      if (from.name === ROUTES.CART.NAME || from.name === ROUTES.CART_ID.NAME) {
        next();
      } else if (from.name === "CheckoutPaymentResult" && to.name === "CheckoutPayment") {
        next();
      } else if (to.params.cartId) {
        next({ name: ROUTES.CART_ID.NAME, params: { cartId: to.params.cartId }, replace: true });
      } else {
        next({ name: ROUTES.CART.NAME, replace: true });
      }
    },
  },
];
