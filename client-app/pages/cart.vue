<template>
  <VcLoaderOverlay v-if="!initialized" no-bg />

  <VcEmptyPage
    v-else-if="!cart.items?.length"
    :title="$t('pages.cart.title')"
    :description="$t('pages.cart.empty_cart_description')"
    image="/static/images/errors/emptyCart.webp"
    mobile-image="/static/images/errors/emptyCartMobile.webp"
    :breadcrumbs="breadcrumbs"
  >
    <template #actions>
      <VcButton :to="{ name: 'Catalog' }" size="lg" class="w-48 uppercase font-bold">
        {{ $t("common.buttons.continue_shopping") }}
      </VcButton>
    </template>
  </VcEmptyPage>

  <VcContainer v-else>
    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block mx-5 md:mx-0" />

    <!-- Page title -->
    <VcTypography tag="h1" variant="h2" weight="bold" class="mb-5">
      {{ $t("pages.cart.title") }}
    </VcTypography>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <template #main>
        <ProductsSection
          :grouped="!!$cfg.line_items_group_by_vendor_enabled"
          :items="cart.items"
          :items-grouped-by-vendor="lineItemsGroupedByVendor"
          :disabled="loading"
          :validation-errors="cart.validationErrors"
          @change:item:quantity="changeItemQuantity($event.item.id, $event.quantity)"
          @remove:item="handleRemoveItem"
          @clear:cart="openClearCartModal"
        />

        <GiftsSection
          v-if="$cfg.checkout_gifts_enabled && availableExtendedGifts.length"
          :gifts="availableExtendedGifts"
          :disabled="loading"
          @toggle:gift="toggleGift"
        />

        <ShippingDetailsSection
          :shipment="shipment"
          :disabled="loading"
          @change:address="onDeliveryAddressChange"
          @change:method="openSelectShipmentMethodModal"
        />

        <BillingDetailsSection
          v-model:address-equals-shipping-address="billingAddressEqualsShippingAddress"
          :payment="payment"
          :disabled="loading"
          @change:address="onBillingAddressChange"
          @change:method="openSelectPaymentMethodModal"
        />

        <OrderCommentSection v-model:comment="comment" :disabled="loading" />
      </template>

      <template #sidebar>
        <OrderSummary :cart="cart">
          <template #header>
            <!-- Purchase order number -->
            <VcActionInput
              v-if="$cfg.checkout_purchase_order_enabled"
              v-model="purchaseOrderNumber"
              :label="$t('common.labels.purchase_order_number')"
              :placeholder="$t('common.placeholders.purchase_order_number')"
              :is-applied="purchaseOrderNumberIsApplied"
              :is-disabled="loading"
              :max-length="128"
              class="mb-5"
              @click:apply="setPurchaseOrderNumber"
              @click:deny="removePurchaseOrderNumber"
            />

            <!-- Promotion code -->
            <VcActionInput
              v-if="$cfg.checkout_coupon_enabled"
              v-model="couponCode"
              :label="$t('common.labels.promotion_code')"
              :placeholder="$t('common.placeholders.promotion_code')"
              :is-applied="couponIsApplied"
              :error-message="couponValidationError"
              :is-disabled="loading"
              class="mb-5"
              @click:apply="applyCoupon"
              @click:deny="removeCoupon"
              @update:model-value="clearCouponValidationError"
            />
          </template>

          <template #footer>
            <p class="mt-6 mb-5 text-xs font-normal text-gray-400">
              {{ $t("common.messages.checkout_pricing_warning") }}
            </p>

            <VcButton
              :is-disabled="orderCreationDisabled"
              :is-waiting="creatingOrder"
              class="uppercase w-full"
              @click="createOrder"
            >
              {{ $t("common.buttons.place_order") }}
            </VcButton>

            <div
              v-if="!isValidCheckout && !creatingOrder"
              class="flex items-center space-x-2 bg-primary-100 rounded mt-3 p-3 text-xs"
            >
              <i class="fas fa-exclamation-triangle text-xl text-primary-600" />
              <span>{{ $t("common.messages.something_went_wrong") }}</span>
            </div>
          </template>
        </OrderSummary>

        <!-- Create quote widget -->
        <VcCardWidget v-if="$cfg.quotes_enabled && isAuthenticated" :title="$t('common.titles.quote_request')">
          <p class="mb-5 text-xs font-normal text-gray-400">
            {{ $t("common.messages.quote_request") }}
          </p>

          <VcButton
            :is-disabled="loading"
            :is-waiting="creatingQuote"
            class="w-full uppercase"
            is-outline
            @click="createQuote"
          >
            {{ $t("common.buttons.create_quote") }}
          </VcButton>
        </VcCardWidget>
      </template>
    </VcLayoutWithRightSidebar>
  </VcContainer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { invoke } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { LineItemType } from "@/xapi";
import { useGoogleAnalytics, usePageHead } from "@/core";
import { useUser } from "@/shared/account";
import { GiftsSection, ProductsSection, useCart, useCoupon, usePurchaseOrderNumber } from "@/shared/cart";
import {
  BillingDetailsSection,
  OrderCommentSection,
  OrderSummary,
  ShippingDetailsSection,
  useCheckout,
} from "@/shared/checkout";

const router = useRouter();
const ga = useGoogleAnalytics();
const { t } = useI18n();
const { isAuthenticated } = useUser();
const {
  cart,
  lineItemsGroupedByVendor,
  availableExtendedGifts,
  fetchCart,
  changeItemQuantity,
  removeItem,
  toggleGift,
  openClearCartModal,
  createQuoteFromCart,
} = useCart();
const {
  comment,
  billingAddressEqualsShippingAddress,
  loading: loadingCheckout,
  shipment,
  payment,
  initialized,
  isValidCheckout,
  initialize,
  openSelectShipmentMethodModal,
  openSelectPaymentMethodModal,
  onDeliveryAddressChange,
  onBillingAddressChange,
  createOrderFromCart,
} = useCheckout();
const { purchaseOrderNumber, purchaseOrderNumberIsApplied, setPurchaseOrderNumber, removePurchaseOrderNumber } =
  usePurchaseOrderNumber();
const { couponCode, couponIsApplied, couponValidationError, applyCoupon, removeCoupon, clearCouponValidationError } =
  useCoupon();

usePageHead({
  title: t("pages.cart.meta.title"),
});

const breadcrumbs: IBreadcrumbs[] = [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.cart"), route: { name: "Cart" } },
];

const creatingOrder = ref(false);
const creatingQuote = ref(false);

const loading = computed<boolean>(() => creatingOrder.value || creatingQuote.value || loadingCheckout.value);
const orderCreationDisabled = computed<boolean>(() => loading.value || !isValidCheckout.value);

async function handleRemoveItem(lineItem: LineItemType): Promise<void> {
  await removeItem(lineItem.id);

  /**
   * Send Google Analytics event for an item was removed from cart.
   */
  ga.removeItemFromCart(lineItem);
}

async function createOrder(): Promise<void> {
  creatingOrder.value = true;

  const order = await createOrderFromCart();

  if (order) {
    await router.push({
      name: "CheckoutComplete",
      params: {
        orderId: order.id,
        orderNumber: order.number,
      },
    });
  }

  await fetchCart();

  creatingOrder.value = false;
}

async function createQuote(): Promise<void> {
  creatingQuote.value = true;

  const quote = await createQuoteFromCart();

  if (quote) {
    await router.push({
      name: "EditQuote",
      params: { quoteId: quote.id },
    });
  }

  await fetchCart();

  creatingQuote.value = false;
}

invoke(async () => {
  await initialize();

  /**
   * Send a Google Analytics shopping cart view event.
   */
  ga.viewCart(cart.value);
});
</script>
