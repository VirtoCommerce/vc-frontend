import { defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames.ts";
import { loadModuleLocale } from "../utils";
import {
  ENABLED_KEY,
  MOCK_PAYMENT_TYPE_NAME,
  MODULE_ID,
  PAYMENT_METHODS_ROUTE_NAME,
  SUBSCRIPTION_DETAILS_ROUTE_NAME,
  SUBSCRIPTIONS_ROUTE_NAME,
} from "./constants";
import type { Product } from "@/core/api/graphql/types";
import type { MenuType, PreparedLineItemType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const Subscriptions = () => import("./pages/subscriptions.vue");
const SubscriptionDetails = () => import("./pages/subscription-details.vue");
const PaymentMethods = () => import("./pages/payment-methods.vue");

const PurchaseOptions = defineAsyncComponent(() => import("./components/purchase-options.vue"));
const CartLineSubscription = defineAsyncComponent(() => import("./components/cart-line-subscription.vue"));
const CheckoutSubscriptionTerms = defineAsyncComponent(() => import("./components/checkout-subscription-terms.vue"));
const MockCardPayment = defineAsyncComponent(() => import("./components/mock-card-payment.vue"));

const { isEnabled } = useModuleSettings(MODULE_ID);
const { register } = useExtensionRegistry();
const { mergeMenuSchema } = useNavigations();

const routes: RouteRecordRaw[] = [
  {
    path: "subscriptions",
    children: [
      { path: "", name: SUBSCRIPTIONS_ROUTE_NAME, component: Subscriptions },
      { path: ":subscriptionId", name: SUBSCRIPTION_DETAILS_ROUTE_NAME, component: SubscriptionDetails, props: true },
    ],
  },
  { path: "payment-methods", name: PAYMENT_METHODS_ROUTE_NAME, component: PaymentMethods },
];

const subscriptionsLink = {
  id: "product-subscriptions",
  route: { name: SUBSCRIPTIONS_ROUTE_NAME },
  title: "product_subscriptions.navigation.subscriptions",
  icon: "refresh",
  priority: 25,
};

const paymentMethodsLink = {
  id: "saved-payment-methods",
  route: { name: PAYMENT_METHODS_ROUTE_NAME },
  title: "product_subscriptions.navigation.payment_methods",
  icon: "credit-card",
  priority: 15,
};

const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      purchasing: { children: [subscriptionsLink] },
      user: { children: [paymentMethodsLink] },
    },
    mobile: {
      purchasing: { children: [subscriptionsLink] },
      user: { children: [paymentMethodsLink] },
    },
  },
};

function isMockPayment({ paymentTypeName }: { paymentTypeName: string }) {
  return paymentTypeName === MOCK_PAYMENT_TYPE_NAME;
}

export function init(router: Router, i18n: I18n) {
  if (!isEnabled(ENABLED_KEY)) {
    return;
  }

  const { isAuthenticated } = useUser();

  void loadModuleLocale(i18n, "product-subscriptions");

  routes.forEach((route) => router.addRoute("Account", route));

  if (isAuthenticated.value) {
    mergeMenuSchema(menuItems);
  }

  // Subscribe & Save choice on the product page (simple products; configurable products keep the core flow).
  register("productPage", EXTENSION_NAMES.productPage.purchaseOptions, {
    component: PurchaseOptions,
    condition: (product: Product) => !product.isConfigurable && !product.hasVariations,
  });

  register("cartLineItem", EXTENSION_NAMES.cartLineItem.details, {
    component: CartLineSubscription,
    condition: (lineItem: PreparedLineItemType) => !!lineItem.productId && !lineItem.isConfigurable,
  });

  register("checkoutReview", EXTENSION_NAMES.checkoutReview.beforePlaceOrder, {
    component: CheckoutSubscriptionTerms,
  });

  // The mock stored-card payment method, on the checkout payment step and the order payment page.
  register("paymentPage", MOCK_PAYMENT_TYPE_NAME, { component: MockCardPayment, condition: isMockPayment });
  register("orderPaymentPage", MOCK_PAYMENT_TYPE_NAME, { component: MockCardPayment, condition: isMockPayment });
}
