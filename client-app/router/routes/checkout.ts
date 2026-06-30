import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
import { setGlobals } from "@/core/globals";
import { ROUTES } from "./constants";
import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordName, RouteRecordRaw } from "vue-router";

const Checkout = () => import("@/pages/checkout/index.vue");
const Billing = () => import("@/pages/checkout/billing.vue");
const Completed = () => import("@/pages/checkout/completed.vue");
const PaymentResult = () => import("@/pages/checkout/payment-result.vue");
const Payment = () => import("@/pages/checkout/payment.vue");
const Review = () => import("@/pages/checkout/review.vue");
const Shipping = () => import("@/pages/checkout/shipping.vue");

type UcpHandoffRestoreType = {
  cartId: string;
  buyerId?: string;
};

const UCP_HANDOFF_STORAGE_PREFIX = "ucp-handoff:";

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

function getUcpHandoffStorageKey(ucpSession: string): string {
  return `${UCP_HANDOFF_STORAGE_PREFIX}${ucpSession}`;
}

function applyUcpHandoffBuyer(buyerId?: string): void {
  if (!buyerId) {
    return;
  }

  localStorage.setItem(USER_ID_LOCAL_STORAGE, buyerId);
  setGlobals({ userId: buyerId });
}

// eslint-disable-next-line sonarjs/function-return-type
function getCachedUcpHandoffRestore(ucpSession: string): UcpHandoffRestoreType | undefined {
  const value = sessionStorage.getItem(getUcpHandoffStorageKey(ucpSession));
  let result: UcpHandoffRestoreType | undefined;

  if (value) {
    try {
      result = JSON.parse(value) as UcpHandoffRestoreType;
    } catch {
      sessionStorage.removeItem(getUcpHandoffStorageKey(ucpSession));
    }
  }

  return result;
}

function cacheUcpHandoffRestore(ucpSession: string, value: UcpHandoffRestoreType): void {
  sessionStorage.setItem(getUcpHandoffStorageKey(ucpSession), JSON.stringify(value));
}

async function restoreUcpHandoffCart(ucpSession: string): Promise<UcpHandoffRestoreType> {
  const headers = new Headers({
    "content-type": "application/json",
    accept: "application/json",
  });

  const response = await fetch("/ucp/v1/internal/handoff/restore", {
    method: "POST",
    credentials: "omit",
    cache: "no-store",
    headers,
    body: JSON.stringify({ ucp_session: ucpSession }),
  });

  if (!response.ok) {
    const cached = getCachedUcpHandoffRestore(ucpSession);

    if (cached) {
      return cached;
    }

    const details = await response.text().catch(() => "");
    throw new Error(`Unable to restore UCP handoff session. Status: ${response.status}. ${details}`);
  }

  const payload = (await response.json()) as {
    checkout?: {
      cart_id?: string;
      buyer?: { id?: string };
      cart?: { id?: string; buyer_id?: string };
    };
  };
  const cartId = payload.checkout?.cart_id ?? payload.checkout?.cart?.id;
  const buyerId = payload.checkout?.buyer?.id ?? payload.checkout?.cart?.buyer_id;

  if (!cartId) {
    throw new Error("UCP handoff session does not include cart id.");
  }

  const restore = { cartId, buyerId };
  cacheUcpHandoffRestore(ucpSession, restore);

  return restore;
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
      if (typeof to.query.ucp_session === "string") {
        try {
          const { cartId, buyerId } = await restoreUcpHandoffCart(to.query.ucp_session);
          applyUcpHandoffBuyer(buyerId);
          next({ name: ROUTES.CART_ID.NAME, params: { cartId }, query: { ucp_handoff: "1" }, replace: true });
        } catch (error) {
          console.error("Unable to restore UCP handoff session.", error);
          next({ name: ROUTES.CART.NAME, replace: true });
        }
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
