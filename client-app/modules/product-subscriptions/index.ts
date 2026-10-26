import { defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames.ts";
import { loadModuleLocale } from "../utils";
import { ENABLED_KEY, MOCK_PAYMENT_TYPE_NAME, MODULE_ID } from "./constants";
import { menuItems } from "./menu";
import { routes } from "./routes";
import type { Product } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

const PurchaseOptions = defineAsyncComponent(() => import("./components/purchase-options.vue"));
const CartLineSubscription = defineAsyncComponent(() => import("./components/cart-line-subscription.vue"));
const CheckoutSubscriptionTerms = defineAsyncComponent(() => import("./components/checkout-subscription-terms.vue"));
const MockCardPayment = defineAsyncComponent(() => import("./components/mock-card-payment.vue"));
const AddCardMock = defineAsyncComponent(() => import("./components/add-card-mock.vue"));

const { isEnabled } = useModuleSettings(MODULE_ID);
const { register } = useExtensionRegistry();
const { mergeMenuSchema } = useNavigations();

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
  // Its card form on the account's payment methods page.
  register("addCardForm", MOCK_PAYMENT_TYPE_NAME, { component: AddCardMock });
}
