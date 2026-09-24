import { apolloClient } from "@/core/api/graphql";
import { MergeCartDocument } from "@/core/api/graphql/types";
import { useAuth } from "@/core/composables/useAuth";
import { globals } from "@/core/globals";
import { readUcpContinuation, removeUcpContinuation } from "@/shared/checkout/ucp/continuation";
import { applyUcpHandoffBuyer, restoreUcpHandoffCart, UcpHandoffRestoreError } from "@/shared/checkout/ucp/handoff";
import { useNotifications } from "@/shared/notification";
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

async function restoreHandoff(reference: string): Promise<string> {
  const session = readUcpContinuation(reference);
  if (!session) {
    throw new UcpHandoffRestoreError("Handoff continuation is no longer available in this tab.", 400);
  }
  const { cartId, anonymousBuyerId } = await restoreUcpHandoffCart(session);
  applyUcpHandoffBuyer(anonymousBuyerId);
  if (!anonymousBuyerId || !useAuth().headers.value.Authorization) {
    return cartId;
  }

  const { data } = await apolloClient.mutate({
    mutation: MergeCartDocument,
    variables: {
      command: {
        secondCartId: cartId,
        userId: globals.userId,
        storeId: globals.storeId,
        currencyCode: globals.currencyCode,
        cultureName: globals.cultureName,
      },
    },
  });
  if (!data?.mergeCart?.id) {
    throw new Error("Unable to transfer the anonymous handoff cart.");
  }
  return data.mergeCart.id;
}

async function handleHandoff(to: RouteLocationNormalized, next: NavigationGuardNext, reference: string) {
  try {
    const cartId = await restoreHandoff(reference);
    removeUcpContinuation(reference);
    next({ name: ROUTES.CART_ID.NAME, params: { cartId }, query: { ucp_handoff: "1" }, replace: true });
  } catch (error) {
    const status = error instanceof UcpHandoffRestoreError ? error.status : undefined;
    if (status !== 401) {
      const messages: Record<number, string> = { 403: "wrong_account", 400: "expired" };
      const message = messages[status ?? 0] ?? "restore_failed";
      useNotifications().error({ text: globals.i18n.global.t(`common.ucp.${message}`) });
    }
    if (status === 401 || status === 403) {
      next({ name: ROUTES.SIGN_IN.NAME, query: { returnUrl: to.fullPath, reauthenticate: "1" }, replace: true });
      return;
    }
    next({ name: ROUTES.CART.NAME, replace: true });
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
    async beforeEnter(to, from, next) {
      if (typeof to.query.ucp_resume === "string") {
        await handleHandoff(to, next, to.query.ucp_resume);
        return;
      }

      if (from.name === ROUTES.CART.NAME || from.name === ROUTES.CART_ID.NAME) {
        next();
      } else if (from.name === "CheckoutPaymentResult" && to.name === "CheckoutPayment") {
        next();
      } else if (to.query.ucp_handoff === "1") {
        next();
      } else if (to.params.cartId) {
        next({ name: ROUTES.CART_ID.NAME, params: { cartId: to.params.cartId }, replace: true });
      } else {
        next({ name: ROUTES.CART.NAME, replace: true });
      }
    },
  },
];
