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

    <VcBreadcrumbs :items="breadcrumbs" class="mx-6 hidden md:mx-0 lg:block" />

    <!-- Page title -->
    <VcTypography tag="h1" variant="h2" weight="bold" class="mx-6 mb-5 print:mx-0 lg:mx-0">
      {{ $t("pages.cart.title") }}
    </VcTypography>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <ProductsSection
        :grouped="!!$cfg.line_items_group_by_vendor_enabled"
        :items="cart.items"
        :items-grouped-by-vendor="lineItemsGroupedByVendor"
        :selected-item-ids="selectedItemIds"
        :disabled="loading"
        :validation-errors="cart.validationErrors"
        @change:item-quantity="changeItemQuantity($event.itemId, $event.quantity, { reloadFullCart: true })"
        @select:items="handleSelectItems"
        @remove:items="handleRemoveItems"
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
        <OrderSummary :cart="cart!" :selected-items="selectedLineItems" :no-shipping="allItemsAreDigital" footnote>
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
              :loading="loadingCheckout"
              full-width
              class="mt-4"
              @click="createOrderFromCart"
            >
              {{ $t("common.buttons.place_order") }}
            </VcButton>

            <template v-if="!$cfg.checkout_multistep_enabled">
              <transition name="slide-fade-top" mode="out-in" appear>
                <VcAlert
                  v-show="isShowIncompleteDataWarning"
                  color="warning"
                  size="sm"
                  variant="solid-light"
                  class="mt-4"
                  icon
                >
                  {{ $t("common.messages.fill_all_required") }}
                </VcAlert>
              </transition>
            </template>

            <transition name="slide-fade-top" mode="out-in" appear>
              <VcAlert
                v-show="hasValidationErrors && !hasOnlyUnselectedValidationError"
                color="warning"
                size="sm"
                variant="solid-light"
                class="mt-4"
                icon
              >
                {{ $t("common.messages.something_went_wrong") }}
              </VcAlert>
            </transition>
          </template>
        </OrderSummary>

        <!-- Create quote widget -->
        <VcWidget
          v-if="$cfg.quotes_enabled && isAuthenticated"
          :title="$t('common.titles.quote_request')"
          class="print:hidden"
        >
          <p class="mb-5 text-xs font-normal text-gray-400">
            {{ $t("common.messages.quote_request") }}
          </p>

          <VcButton :disabled="loading" :loading="creatingQuote" full-width variant="outline" @click="createQuote">
            {{ $t("common.buttons.create_quote") }}
          </VcButton>
        </VcWidget>
      </template>
    </VcLayoutWithRightSidebar>

    <transition name="slide-fade-bottom">
      <div
        v-if="!isEmpty(selectedItemIds)"
        class="fixed bottom-0 left-0 z-10 flex w-full justify-center bg-[--color-additional-50] p-6 shadow-t-lgs md:hidden"
      >
        <VcButton
          variant="outline"
          prepend-icon="trash"
          :disabled="loading"
          @click="handleRemoveItems(selectedItemIds)"
        >
          {{ $t("common.buttons.remove_selected") }}
        </VcButton>
      </div>
    </transition>
  </VcContainer>
</template>

<script setup lang="ts">
import { invoke } from "@vueuse/core";
import { isEmpty, without, union } from "lodash";
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
  selectedItemIds,
  selectedLineItems,
  lineItemsGroupedByVendor,
  availableExtendedGifts,
  availableShippingMethods,
  availablePaymentMethods,
  hasValidationErrors,
  hasOnlyUnselectedValidationError,
  allItemsAreDigital,
  fetchFullCart,
  changeItemQuantity,
  removeItems,
  toggleGift,
  openClearCartModal,
  createQuoteFromCart,
} = useCart();
const {
  loading: loadingCheckout,
  comment,
  purchaseOrderNumber,
  billingAddressEqualsShipping,
  isValidShipment,
  isValidPayment,
  isValidCheckout,
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
const creatingQuote = ref(false);

const loading = computed<boolean>(() => loadingCart.value || loadingCheckout.value || creatingQuote.value);
const isDisabledNextStep = computed<boolean>(
  () => loading.value || hasValidationErrors.value || isEmpty(selectedItemIds.value),
);
const isDisabledOrderCreation = computed<boolean>(
  () => loading.value || !isValidCheckout.value || isEmpty(selectedItemIds.value),
);
const cartContainsDeletedProducts = computed<boolean | undefined>(
  () => cart.value?.items?.some((item: LineItemType) => !item.product),
);
const isShowIncompleteDataWarning = computed<boolean>(
  () => (!allItemsAreDigital.value && !isValidShipment.value) || !isValidPayment.value,
);

async function handleRemoveItems(itemIds: string[]): Promise<void> {
  await removeItems(itemIds);

  /**
   * Send Google Analytics event for an item was removed from cart.
   */
  ga.removeItemsFromCart(cart.value!.items!.filter((item) => itemIds.includes(item.id)));
}

function handleSelectItems(value: { itemIds: string[]; selected: boolean }) {
  if (!value.selected) {
    selectedItemIds.value = without(selectedItemIds.value, ...value.itemIds);
  } else {
    selectedItemIds.value = union(selectedItemIds.value, value.itemIds);
  }
}

function onChangeBillingAddress() {
  if (!allItemsAreDigital.value && billingAddressEqualsShipping.value) {
    onDeliveryAddressChange();
  } else {
    onBillingAddressChange();
  }
}

// FIXME: Move to composable
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
  if (cart.value) {
    ga.viewCart(cart.value);
  }
});
</script>
