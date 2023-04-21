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
      <VcButton :to="{ name: 'Catalog' }" size="lg" class="w-48 font-bold uppercase">
        {{ $t("common.buttons.continue_shopping") }}
      </VcButton>
    </template>
  </VcEmptyPage>

  <VcContainer v-else class="relative z-0">
    <VcLoaderOverlay :visible="loading" fixed-spinner />

    <VcBreadcrumbs :items="breadcrumbs" class="mx-5 hidden md:mx-0 lg:block" />

    <!-- Page title -->
    <VcTypography tag="h1" variant="h2" weight="bold" class="mb-5">
      {{ $t("pages.cart.title") }}
    </VcTypography>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <ProductsSection
        :grouped="!!$cfg.line_items_group_by_vendor_enabled"
        :items="cart.items"
        :items-grouped-by-vendor="lineItemsGroupedByVendor"
        :disabled="loading"
        :validation-errors="cart.validationErrors"
        @change:item-quantity="changeItemQuantity($event.item.id, $event.quantity)"
        @remove:item="handleRemoveItem"
        @clear:cart="openClearCartModal"
      />

      <GiftsSection
        v-if="$cfg.checkout_gifts_enabled && availableExtendedGifts.length"
        :gifts="availableExtendedGifts"
        :disabled="loading"
        @toggle:gift="toggleGift"
      />

      <!-- Sections for single page checkout -->
      <template v-if="!$cfg.checkout_multistep_enabled">
        <ShippingDetailsSection
          v-if="!allItemsAreDigital"
          :methods="availableShippingMethods"
          :shipment="shipment"
          :disabled="loading"
          @change:address="onDeliveryAddressChange"
          @change:method="setShippingMethod"
        />

        <BillingDetailsSection
          v-model:address-equals-shipping-address="billingAddressEqualsShipping"
          v-model:purchase-order-number="purchaseOrderNumber"
          :purchase-order-number-enabled="isPurchaseOrderNumberEnabled"
          :methods="availablePaymentMethods"
          :payment="payment"
          :shipment="allItemsAreDigital ? undefined : shipment"
          :disabled="loading"
          @change:address="onChangeBillingAddress"
          @change:method="setPaymentMethod"
        />

        <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" :disabled="loading" />
      </template>

      <template #sidebar>
        <OrderSummary :cart="cart" :no-shipping="allItemsAreDigital" footnote>
          <template #footer>
            <!-- Purchase order number -->
            <VcActionInput
              v-if="$cfg.checkout_purchase_order_enabled && !$cfg.checkout_multistep_enabled"
              v-model="purchaseOrderNumberOld"
              :label="$t('common.labels.purchase_order_number')"
              :placeholder="$t('common.placeholders.purchase_order_number')"
              :applied="purchaseOrderNumberIsApplied"
              :disabled="loading"
              :max-length="128"
              class="mt-4"
              @apply="setPurchaseOrderNumber"
              @deny="removePurchaseOrderNumber"
            />

            <!-- Promotion code -->
            <VcActionInput
              v-if="$cfg.checkout_coupon_enabled"
              v-model="couponCode"
              :label="$t('common.labels.promotion_code')"
              :placeholder="$t('common.placeholders.promotion_code')"
              :applied="couponIsApplied"
              :error-message="couponValidationError"
              :disabled="loading"
              class="mt-4"
              @apply="applyCoupon"
              @deny="removeCoupon"
              @update:model-value="clearCouponValidationError"
            />

            <!-- Go to checkout button (Multistep checkout) -->
            <VcButton
              v-if="$cfg.checkout_multistep_enabled"
              :to="{ name: 'Checkout' }"
              :is-disabled="isDisabledNextStep"
              class="mt-4 w-full uppercase"
            >
              {{ $t("common.buttons.go_to_checkout") }}
            </VcButton>

            <!-- Place order button (Single page checkout) -->
            <VcButton
              v-else
              :is-disabled="isDisabledOrderCreation"
              :is-waiting="creatingOrder"
              class="mt-4 w-full uppercase"
              @click="createOrder"
            >
              {{ $t("common.buttons.place_order") }}
            </VcButton>

            <template v-if="!$cfg.checkout_multistep_enabled">
              <transition name="slide-fade-top" mode="out-in" appear>
                <VcAlert v-show="isShowIncompleteDataWarning" type="warning" class="mt-4" icon>
                  {{ $t("common.messages.fill_all_required") }}
                </VcAlert>
              </transition>
            </template>

            <transition name="slide-fade-top" mode="out-in" appear>
              <VcAlert v-show="hasValidationErrors" type="warning" class="mt-4" icon>
                {{ $t("common.messages.something_went_wrong") }}
              </VcAlert>
            </transition>
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
import { invoke } from "@vueuse/core";
import { computed, inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
import { useUser } from "@/shared/account";
import { GiftsSection, ProductsSection, useCart, useCoupon, usePurchaseOrderNumber } from "@/shared/cart";
import {
  BillingDetailsSection,
  OrderCommentSection,
  OrderSummary,
  ShippingDetailsSection,
  useCheckout,
} from "@/shared/checkout";
import type { LineItemType } from "@/xapi/types";

const config = inject(configInjectionKey, {});

const router = useRouter();
const ga = useGoogleAnalytics();
const { t } = useI18n();
const { isAuthenticated } = useUser();
const {
  loading: loadingCart,
  cart,
  shipment,
  payment,
  lineItemsGroupedByVendor,
  availableExtendedGifts,
  availableShippingMethods,
  availablePaymentMethods,
  hasValidationErrors,
  allItemsAreDigital,
  fetchCart,
  changeItemQuantity,
  removeItem,
  toggleGift,
  openClearCartModal,
  createQuoteFromCart,
} = useCart();
const {
  comment,
  purchaseOrderNumber,
  billingAddressEqualsShipping,
  isValidShipment,
  isValidPayment,
  isValidCheckout,
  canPayNow,
  isPurchaseOrderNumberEnabled,
  initialize: initCheckout,
  onDeliveryAddressChange,
  onBillingAddressChange,
  setShippingMethod,
  setPaymentMethod,
  createOrderFromCart,
} = useCheckout();
const {
  purchaseOrderNumber: purchaseOrderNumberOld,
  purchaseOrderNumberIsApplied,
  setPurchaseOrderNumber,
  removePurchaseOrderNumber,
} = usePurchaseOrderNumber();
const { couponCode, couponIsApplied, couponValidationError, applyCoupon, removeCoupon, clearCouponValidationError } =
  useCoupon();

usePageHead({
  title: t("pages.cart.meta.title"),
});

const breadcrumbs = useBreadcrumbs([{ title: t("common.links.cart"), route: { name: "Cart" } }]);

const initialized = ref(false);
const creatingOrder = ref(false);
const creatingQuote = ref(false);

const loading = computed<boolean>(() => loadingCart.value || creatingQuote.value || creatingOrder.value);
const isDisabledNextStep = computed<boolean>(() => loading.value || hasValidationErrors.value);
const isDisabledOrderCreation = computed<boolean>(() => loading.value || !isValidCheckout.value);
const isShowIncompleteDataWarning = computed<boolean>(
  () => (!allItemsAreDigital.value && !isValidShipment.value) || !isValidPayment.value
);

async function handleRemoveItem(lineItem: LineItemType): Promise<void> {
  await removeItem(lineItem.id);

  /**
   * Send Google Analytics event for an item was removed from cart.
   */
  ga.removeItemFromCart(lineItem);
}

function onChangeBillingAddress() {
  if (!allItemsAreDigital.value && billingAddressEqualsShipping.value) {
    onDeliveryAddressChange();
  } else {
    onBillingAddressChange();
  }
}

async function createOrder(): Promise<void> {
  creatingOrder.value = true;

  const order = await createOrderFromCart();

  if (order) {
    await router.push({ name: canPayNow.value ? "CheckoutPayment" : "CheckoutCompleted" });
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
  if (config.checkout_multistep_enabled) {
    await fetchCart();
  } else {
    await initCheckout();
  }

  initialized.value = true;

  /**
   * Send a Google Analytics shopping cart view event.
   */
  ga.viewCart(cart.value);
});
</script>
