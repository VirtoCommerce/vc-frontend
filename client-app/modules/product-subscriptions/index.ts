import { defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables";
import { useCheckoutGuards } from "@/shared/checkout/composables/useCheckoutGuards";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames.ts";
import { loadModuleLocale } from "../utils";
import { isCartLineSubscribed } from "./composables/useCartSubscriptions";
import { useSubscriptionCheckout } from "./composables/useSubscriptionCheckout";
import { useSubscriptionOffers } from "./composables/useSubscriptionOffers";
import { ENABLED_KEY, MOCK_PAYMENT_TYPE_NAME, MODULE_ID, TERMS_GUARD_ID } from "./constants";
import { menuItems } from "./menu";
import { publicRoutes, routes } from "./routes";
import type { Product } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

const PurchaseOptions = defineAsyncComponent(() => import("./components/purchase-options.vue"));
const CartLineSubscription = defineAsyncComponent(() => import("./components/cart-line-subscription.vue"));
const OrderLineSubscription = defineAsyncComponent(() => import("./components/order-line-subscription.vue"));
const OrderSubscriptionBadge = defineAsyncComponent(() => import("./components/order-subscription-badge.vue"));
const OrderSubscriptionNotice = defineAsyncComponent(() => import("./components/order-subscription-notice.vue"));
const CartLineSubscribeButton = defineAsyncComponent(() => import("./components/cart-line-subscribe-button.vue"));
const CheckoutSubscriptionTerms = defineAsyncComponent(() => import("./components/checkout-subscription-terms.vue"));
const MockCardPayment = defineAsyncComponent(() => import("./components/mock-card-payment.vue"));
const AddCardMock = defineAsyncComponent(() => import("./components/add-card-mock.vue"));

const { isEnabled } = useModuleSettings(MODULE_ID);
const { register } = useExtensionRegistry();
const { mergeMenuSchema } = useNavigations();
const { offerFor } = useSubscriptionOffers();

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
  publicRoutes.forEach((route) => router.addRoute(route));

  if (isAuthenticated.value) {
    mergeMenuSchema(menuItems);
  }

  // Subscribe & Save choice on the product page: a simple or configurable product, or the variation picked on a B2C
  // variations page. A configurable product is subscribed to with the options chosen on the page.
  register("productPage", EXTENSION_NAMES.productPage.purchaseOptions, {
    component: PurchaseOptions,
    condition: (product: Product) => !product.hasVariations,
  });

  // The same choice, compact, in each row of a variations table or list (B2B). Back in stock keeps the rows it takes.
  register("productPage", EXTENSION_NAMES.productPage.variationPurchaseOptions, {
    component: PurchaseOptions,
    condition: (product: Product) => !product.isConfigurable,
  });

  // Also loads the offers of the cart's products, which the Subscribe button's condition reads.
  register("cartLineItem", EXTENSION_NAMES.cartLineItem.details, {
    component: CartLineSubscription,
    condition: (lineItem: PreparedLineItemType) => !!lineItem.productId,
  });

  // Only for a line that can be subscribed and isn't yet: the host then shows "Save for later" as an icon next to it,
  // and a subscribed line gets its full "Save for later" button back.
  register("cartLineItem", EXTENSION_NAMES.cartLineItem.actions, {
    component: CartLineSubscribeButton,
    condition: (lineItem: PreparedLineItemType) =>
      isAuthenticated.value && !!offerFor(lineItem.productId) && !isCartLineSubscribed(lineItem.id),
  });

  // Order history: a line bought by subscription shows the cart's subscription row, read-only.
  register("orderLineItem", EXTENSION_NAMES.orderLineItem.details, {
    component: OrderLineSubscription,
    condition: () => isAuthenticated.value,
  });

  // Order history: an order a subscription placed itself on its delivery date is marked in the list and on its page.
  register("orderListItem", EXTENSION_NAMES.orderListItem.badge, {
    component: OrderSubscriptionBadge,
    condition: () => isAuthenticated.value,
  });

  register("orderDetails", EXTENSION_NAMES.orderDetails.notice, {
    component: OrderSubscriptionNotice,
    condition: () => isAuthenticated.value,
  });

  useCheckoutGuards().registerGuard(TERMS_GUARD_ID, { canPlaceOrder: useSubscriptionCheckout().canPlaceOrder });

  register("checkoutReview", EXTENSION_NAMES.checkoutReview.beforePlaceOrder, {
    component: CheckoutSubscriptionTerms,
  });

  // The mock stored-card payment method, on the checkout payment step and the order payment page.
  register("paymentPage", MOCK_PAYMENT_TYPE_NAME, { component: MockCardPayment, condition: isMockPayment });
  register("orderPaymentPage", MOCK_PAYMENT_TYPE_NAME, { component: MockCardPayment, condition: isMockPayment });
  // Its card form on the account's payment methods page.
  register("addCardForm", MOCK_PAYMENT_TYPE_NAME, { component: AddCardMock });
}
