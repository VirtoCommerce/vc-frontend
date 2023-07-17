<template>
  <VcLoaderOverlay v-if="!initialized" no-bg />

  <VcEmptyPage
    v-else-if="!cart?.items?.length"
    :title="$t('pages.cart.title')"
    :description="$t('pages.cart.empty_cart_description')"
    image="/static/images/errors/emptyCart.webp"
    mobile-image="/static/images/errors/emptyCartMobile.webp"
    :breadcrumbs="breadcrumbs"
  >
    <template #actions>
      <VcButton :to="{ name: 'Catalog' }" size="lg">
        {{ $t("common.buttons.continue_shopping") }}
      </VcButton>
    </template>
  </VcEmptyPage>

  <VcContainer v-else class="relative z-0">
    <VcLoaderOverlay :visible="loading" fixed-spinner />

    <VcBreadcrumbs :items="breadcrumbs" class="mx-5 hidden md:mx-0 lg:block" />

    <!-- Page title -->
    <VcTypography tag="h1" variant="h2" weight="bold" class="mx-5 mb-5 lg:mx-0">
      {{ $t("pages.cart.title") }}
    </VcTypography>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <ProductsSection
        :grouped="!!$cfg.line_items_group_by_vendor_enabled"
        :items="cart.items"
        :items-grouped-by-vendor="lineItemsGroupedByVendor"
        :selected-items="selectedItems"
        :disabled="loading"
        :validation-errors="cart.validationErrors"
        @change:item-quantity="changeItemQuantity($event.item.id, $event.quantity, { reloadFullCart: true })"
        @select:item="handleSelectItem"
        @select:all-items="handleSelectAllItems"
        @remove:item="handleRemoveItem"
        @remove:selected-items="handleRemoveSelectedItems"
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
        <OrderSummary :cart="cart!" :no-shipping="allItemsAreDigital" footnote>
          <template #footer>
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
              :disabled="isDisabledNextStep"
              full-width
              class="mt-4"
            >
              {{ $t("common.buttons.go_to_checkout") }}
            </VcButton>

            <!-- Place order button (Single page checkout) -->
            <VcButton
              v-else
              :disabled="isDisabledOrderCreation"
              :loading="creatingOrder"
              full-width
              class="mt-4"
              @click="createOrder"
            >
              {{ $t("common.buttons.place_order") }}
            </VcButton>

            <template v-if="!$cfg.checkout_multistep_enabled">
              <transition name="slide-fade-top" mode="out-in" appear>
                <VcAlert v-show="isShowIncompleteDataWarning" color="warning" class="mt-4" icon>
                  {{ $t("common.messages.fill_all_required") }}
                </VcAlert>
              </transition>
            </template>

            <transition name="slide-fade-top" mode="out-in" appear>
              <VcAlert v-show="hasValidationErrors" color="warning" class="mt-4" icon>
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

          <VcButton :disabled="loading" :loading="creatingQuote" variant="outline" @click="createQuote">
            {{ $t("common.buttons.create_quote") }}
          </VcButton>
        </VcCardWidget>
      </template>
    </VcLayoutWithRightSidebar>
  </VcContainer>
</template>

<script setup lang="ts">
import { invoke } from "@vueuse/core";
import _ from "lodash";
import { computed, inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
import { useUser } from "@/shared/account";
import { GiftsSection, ProductsSection, useCart, useCoupon } from "@/shared/cart";
import { CartDeletedProductsModal } from "@/shared/cart/components";
import {
  BillingDetailsSection,
  OrderCommentSection,
  OrderSummary,
  ShippingDetailsSection,
  useCheckout,
} from "@/shared/checkout";
import { usePopup } from "@/shared/popup";
import type { LineItemType } from "@/core/api/graphql/types";

const config = inject(configInjectionKey, {});

const router = useRouter();
const ga = useGoogleAnalytics();
const { t } = useI18n();
const { isAuthenticated } = useUser();
const { openPopup } = usePopup();
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
  fetchFullCart,
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
const cartContainsDeletedProducts = computed<boolean | undefined>(() =>
  cart.value?.items?.some((item) => !item.product)
);
const isShowIncompleteDataWarning = computed<boolean>(
  () => (!allItemsAreDigital.value && !isValidShipment.value) || !isValidPayment.value
);

async function handleRemoveSelectedItems(items: string[]): Promise<void> {
  console.log("handleRemoveSelectedItems", items);
}

const selectedItems = ref<string[]>([]);

function handleSelectItem(value: { id: string; selected: boolean }) {
  if (value.selected && !selectedItems.value.includes(value.id)) {
    selectedItems.value.push(value.id);
  } else if (!value.selected) {
    _.pull(selectedItems.value, value.id);
  }
}

function handleSelectAllItems(value: { items: LineItemType[]; selectAll: boolean }) {
  _.pullAll(selectedItems.value, _.map(value.items, "id"));

  if (value.selectAll) {
    selectedItems.value = [...selectedItems.value, ..._.map(value.items, "id")];
  }
}

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

  await fetchFullCart();

  creatingOrder.value = false;
}

async function createQuote(): Promise<void> {
  if (cartContainsDeletedProducts.value) {
    openPopup({
      component: CartDeletedProductsModal,
    });

    return;
  }

  creatingQuote.value = true;

  const quote = await createQuoteFromCart();

  if (quote) {
    await router.push({
      name: "EditQuote",
      params: { quoteId: quote.id },
    });
  }

  await fetchFullCart();

  creatingQuote.value = false;
}

invoke(async () => {
  if (config.checkout_multistep_enabled) {
    await fetchFullCart();
  } else {
    await initCheckout();
  }

  initialized.value = true;

  /**
   * Send a Google Analytics shopping cart view event.
   */
  ga.viewCart(cart.value!);
});
</script>
