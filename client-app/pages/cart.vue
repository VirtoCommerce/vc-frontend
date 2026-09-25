<template>
  <VcLoaderOverlay v-if="showPageLoader" no-bg />

  <VcContainer v-else :class="['cart', { 'cart--empty': !cart?.items?.length }]">
    <VcLoaderOverlay :visible="isCartLocked" fixed-spinner />

    <VcBreadcrumbs v-if="!hideBreadcrumbs" :items="breadcrumbs" class="cart__breadcrumbs" />

    <VcTypography tag="h1" class="cart__title">
      {{ title ?? $t("pages.cart.title") }}
    </VcTypography>

    <template v-if="!cart?.items?.length">
      <VcWidget class="cart__empty" :border="false" size="md">
        <VcTypography tag="h4">
          {{ $t("pages.cart.empty_cart_description") }}
        </VcTypography>

        <div class="cart__empty-hint">{{ $t("pages.cart.empty_cart_search_text") }}</div>

        <div class="cart__empty-actions">
          <VcButton
            v-if="!!continue_shopping_link"
            :external-link="continue_shopping_link"
            size="lg"
            prepend-icon="shopping-bag"
          >
            {{ $t("common.buttons.continue_shopping") }}
          </VcButton>

          <VcButton v-else to="/" size="lg" prepend-icon="shopping-bag">
            {{ $t("common.buttons.continue_shopping") }}
          </VcButton>

          <VcButton :to="{ name: 'BulkOrder' }" size="lg" variant="outline" prepend-icon="bulk">
            {{ $t("common.buttons.add_with_bulk_order") }}
          </VcButton>
        </div>
      </VcWidget>

      <CartForLater
        v-if="hasAvailableSavedForLaterItems && !shouldHide('cart-for-later')"
        :saved-for-later-list="savedForLaterList"
        :loading="moveFromSavedForLaterOverflowed"
        class="cart__section"
        @add-to-cart="(lineItemId) => handleMoveToCart([lineItemId])"
      />

      <RecentlyBrowsedProducts
        v-if="recentlyBrowsedProducts.length && !shouldHide('recently-browsed-products')"
        :products="recentlyBrowsedProducts"
        class="cart__section"
      />
    </template>

    <template v-else>
      <VcLayout sidebar-position="right" sticky>
        <ProductsSection
          :grouped="!!$cfg.line_items_group_by_vendor_enabled"
          :items="mainCurrencyLineItems"
          :items-grouped-by-vendor="lineItemsGroupedByVendor"
          :other-currency-groups="otherCurrencyLineItemGroups"
          :selected-item-ids="selectedItemIds"
          :validation-errors="cart.validationErrors"
          :disabled="
            changeItemQuantityBatchedOverflowed ||
            moveToSavedForLaterOverflowed ||
            selectionOverflowed ||
            cartMutationsLocked
          "
          data-test-id="cart.products-section"
          :hide-controls="hideControls"
          @change:item-quantity="changeItemQuantityBatched($event.itemId, $event.quantity)"
          @select:items="handleSelectItems"
          @remove:items="handleRemoveItems"
          @save-for-later="handleSaveForLater"
          @clear:cart="openClearCartModal"
          @link-click="selectItemEvent"
        />

        <GiftsSection
          v-if="$cfg.checkout_gifts_enabled && availableExtendedGifts.length"
          :gifts="availableExtendedGifts"
          class="cart__section"
          @toggle:gift="toggleGift"
        />

        <!-- Sections for single page checkout -->
        <template v-if="!$cfg.checkout_multistep_enabled">
          <ShippingDetailsSection v-if="!allItemsAreDigital" class="cart__section" />

          <BillingDetailsSection :cart="cart" />

          <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" class="cart__section" />
        </template>

        <CartForLater
          v-if="hasAvailableSavedForLaterItems && !shouldHide('cart-for-later')"
          :saved-for-later-list="savedForLaterList"
          :loading="moveFromSavedForLaterOverflowed"
          class="cart__section"
          @add-to-cart="(lineItemId) => handleMoveToCart([lineItemId])"
        />

        <RecentlyBrowsedProducts
          v-if="recentlyBrowsedProducts.length && !shouldHide('recently-browsed-products')"
          :products="recentlyBrowsedProducts"
          class="cart__section"
        />

        <template #sidebar>
          <OrderSummary :cart="cart" :selected-items="selectedLineItems" :no-shipping="allItemsAreDigital" footnote>
            <template #footer>
              <LoyaltyValidationAlert class="cart__alert" />

              <ProceedTo
                v-if="$cfg.checkout_multistep_enabled"
                :to="{ name: 'Checkout', params: { cartId: $route.params.cartId } }"
                :disabled="hasOnlyUnselectedLineItems"
                test-id="checkout-button"
                class="cart__action"
              >
                {{ $t("common.buttons.go_to_checkout") }}
              </ProceedTo>

              <PlaceOrder data-test-id="place-order-button" v-else class="cart__action" />

              <template v-if="!$cfg.checkout_multistep_enabled">
                <transition name="slide-fade-top" mode="out-in" appear>
                  <VcAlert
                    v-show="isShowIncompleteDataWarning"
                    color="warning"
                    size="sm"
                    variant="solid-light"
                    class="cart__alert"
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
                  class="cart__alert"
                  icon
                >
                  {{ $t("common.messages.something_went_wrong") }}
                </VcAlert>
              </transition>
            </template>
          </OrderSummary>

          <CouponsSection class="cart__section" />

          <component
            :is="item.element"
            v-for="item in sidebarWidgets.filter((item) => !shouldHide(item.id))"
            :key="item.id"
            class="cart__section"
            @lock-cart="isCartLocked = true"
            @unlock-cart="isCartLocked = false"
          />
        </template>
      </VcLayout>

      <transition name="slide-fade-bottom">
        <div v-if="!loading && cart?.items?.length" class="cart__mobile-bar">
          <div class="cart__mobile-total">
            <span class="me-1">{{ $t("common.labels.total") }}:</span>

            <VcPriceDisplay v-if="cart.total" :value="cart.total" />
          </div>

          <div v-for="cartTotal in otherCartTotals" :key="cartTotal.total.currency.code" class="cart__mobile-total">
            <span class="me-1">
              {{ $t("common.labels.total_in_currency", { currency: cartTotal.total.currency.code }) }}:
            </span>

            <VcPriceDisplay :value="cartTotal.total" />
          </div>

          <ProceedTo
            v-if="$cfg.checkout_multistep_enabled"
            :to="{ name: 'Checkout', params: { cartId: $route.params.cartId } }"
            :disabled="hasOnlyUnselectedLineItems"
            class="cart__mobile-action"
          >
            {{ $t("common.buttons.go_to_checkout") }}
          </ProceedTo>

          <PlaceOrder data-test-id="sticked-place-order-button" v-else class="cart__mobile-action" />
        </div>
      </transition>
    </template>
  </VcContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { recentlyBrowsed } from "@/core/api/graphql";
import { useAnalytics, useBreadcrumbs, usePageHead, useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID_XRECOMMEND, MODULE_XAPI_KEYS, XRECOMMEND_ENABLED_KEY } from "@/core/constants/modules";
import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account";
import { useFullCart } from "@/shared/cart";
import { useCartExtensionPoints } from "@/shared/cart/composables/useCartExtensionPoints";
import { useSavedForLater } from "@/shared/cart/composables/useSaveForLater";
import {
  BillingDetailsSection,
  OrderCommentSection,
  OrderSummary,
  PlaceOrder,
  ProceedTo,
  ShippingDetailsSection,
  useCheckout,
} from "@/shared/checkout";
import type { CartTotalType, LineItemType, Product } from "@/core/api/graphql/types";
import CartForLater from "@/shared/cart/components/cart-for-later.vue";
import CouponsSection from "@/shared/cart/components/coupons-section.vue";
import GiftsSection from "@/shared/cart/components/gifts-section.vue";
import LoyaltyValidationAlert from "@/shared/cart/components/loyalty-validation-alert.vue";
import ProductsSection from "@/shared/cart/components/products-section.vue";
import RecentlyBrowsedProducts from "@/shared/catalog/components/recently-browsed-products.vue";

interface IProps {
  blocksToHide?: string[];
  hideBreadcrumbs?: boolean;
  title?: string;
  hideControls?: string[];
}

const props = defineProps<IProps>();

const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const { themeContext } = useThemeContext();
const { analytics } = useAnalytics();
const { t } = useI18n();
const { isAuthenticated } = useUser();
const {
  loading: loadingCart,
  cart,
  selectedItemIds,
  selectedLineItems,
  lineItemsGroupedByVendor,
  mainCurrencyLineItems,
  otherCurrencyLineItemGroups,
  hasOnlyUnselectedLineItems,
  availableExtendedGifts,
  hasValidationErrors,
  hasOnlyUnselectedValidationError,
  allItemsAreDigital,
  forceFetch,
  changeItemQuantityBatched,
  changeItemQuantityBatchedOverflowed,
  selectionOverflowed,
  removeItems,
  toggleGift,
  openClearCartModal,
  selectCartItems,
  unselectCartItems,
  shipment,
  payment,
  changing: isCartUpdating,
} = useFullCart();
const {
  loading: loadingCheckout,
  comment,
  isValidShipment,
  isValidPayment,
  initialize,
  initialized: checkoutInitialized,
} = useCheckout();

const {
  savedForLaterList,
  moveToSavedForLater,
  moveToSavedForLaterOverflowed,
  moveFromSavedForLater,
  moveFromSavedForLaterOverflowed,
  getSavedForLater,
  hasAvailableItems: hasAvailableSavedForLaterItems,
  loading: saveForLaterLoading,
} = useSavedForLater();

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});
const { isEnabled: isEnabledXRecommend } = useModuleSettings(MODULE_ID_XRECOMMEND);

const { sidebarWidgets } = useCartExtensionPoints();

usePageHead({
  title: t("pages.cart.meta.title"),
});

const breadcrumbs = useBreadcrumbs([{ title: t("common.links.cart"), route: { name: ROUTES.CART.NAME } }]);

const analyticsLastSentShippingOption = ref<string | undefined>();
const analyticsLastSentPaymentCode = ref<string | undefined>();

const isCartLocked = ref(false);
const recentlyBrowsedProducts = ref<Product[]>([]);

const loading = computed(() => loadingCart.value || loadingCheckout.value || saveForLaterLoading.value);

// Only while there is nothing to show at all. `loading` also covers the save-for-later
// mutations, placing the order and the header's ship-to refetch — all of which happen with a
// rendered cart in front of the customer, and swapping the page for a spinner there unmounts
// the whole container, single-page checkout fields included, and loses what they had typed.
const showPageLoader = computed(
  () =>
    loading.value &&
    !cart.value?.items?.length &&
    !recentlyBrowsedProducts.value.length &&
    !hasAvailableSavedForLaterItems.value,
);

const otherCartTotals = computed(
  () =>
    cart.value?.cartTotals?.filter(
      (cartTotal): cartTotal is CartTotalType =>
        !!cartTotal && !cartTotal.isDefaultTotalCurrency && cartTotal.total.currency.code !== cart.value?.currency.code,
    ) ?? [],
);

// On single-page checkout, initialize() fires AddOrUpdateCartShipment/Payment on mount.
// Block user-initiated cart writes until it settles, so a faster mutation (clear cart,
// save for later) can't be overwritten by a late, stale shipment/payment response.
const cartMutationsLocked = computed(() => {
  return !themeContext.value?.settings?.checkout_multistep_enabled && !checkoutInitialized.value;
});

const isShowIncompleteDataWarning = computed(
  () => (!allItemsAreDigital.value && !isValidShipment.value) || !isValidPayment.value,
);

async function handleRemoveItems(itemIds: string[]): Promise<void> {
  const cartBeforeRemove = cart.value!;
  const removedItems = cartBeforeRemove.items.filter((item) => itemIds.some((id) => id === item.id));
  const cartWillBeEmpty = cartBeforeRemove.items.length === removedItems.length;

  await removeItems(itemIds);

  /**
   * Send Google Analytics event for an item was removed from cart.
   */
  analytics("removeItemsFromCart", removedItems);

  if (cartWillBeEmpty) {
    analytics("clearCart", cartBeforeRemove);
  }
}

function handleSelectItems(value: { itemIds: string[]; selected: boolean }) {
  if (!value.selected) {
    unselectCartItems(value.itemIds);
  } else {
    selectCartItems(value.itemIds);
  }
}

async function handleSaveForLater(itemIds: string[]) {
  if (!itemIds?.length || !cart.value?.id) {
    return;
  }

  await moveToSavedForLater(cart.value.id, itemIds);
}

async function handleMoveToCart(itemIds: string[]) {
  if (!itemIds?.length || !cart.value?.id) {
    return;
  }

  await moveFromSavedForLater(cart.value.id, itemIds);
}

function selectItemEvent(item: LineItemType | undefined): void {
  if (!item) {
    return;
  }

  analytics("selectItem", item, {
    item_list_id: "cart",
    item_list_name: t("pages.cart.title"),
  });
}

function shouldHide(id: string) {
  return props.blocksToHide?.some((blockId) => blockId === id);
}

watch(
  [() => isValidShipment.value, () => shipment.value?.shipmentMethodOption, isCartUpdating],
  () => {
    if (
      themeContext.value?.settings?.checkout_multistep_enabled ||
      !cart.value ||
      !isValidShipment.value ||
      isCartUpdating.value
    ) {
      return;
    }

    const option = shipment.value?.shipmentMethodOption;

    if (option && option !== analyticsLastSentShippingOption.value) {
      analytics("addShippingInfo", { ...cart.value, items: selectedLineItems.value }, {}, option);
      analyticsLastSentShippingOption.value = option;
    }
  },
  { immediate: true },
);

watch(
  [() => isValidPayment.value, () => payment.value?.paymentGatewayCode],
  () => {
    if (themeContext.value?.settings?.checkout_multistep_enabled || !cart.value || !isValidPayment.value) {
      return;
    }

    const code = payment.value?.paymentGatewayCode;

    if (code && code !== analyticsLastSentPaymentCode.value) {
      analytics("addPaymentInfo", { ...cart.value, items: selectedLineItems.value }, {}, code);
      analyticsLastSentPaymentCode.value = code;
    }
  },
  { immediate: true },
);

watch(
  () => cart.value?.id,
  () => {
    analyticsLastSentShippingOption.value = undefined;
    analyticsLastSentPaymentCode.value = undefined;
  },
);

void (async () => {
  await forceFetch();

  /**
   * Send a Google Analytics shopping cart view event.
   */
  if (cart.value) {
    analytics("viewCart", cart.value);
  }

  if (!themeContext.value?.settings?.checkout_multistep_enabled) {
    await initialize();
  }

  const isXRecommendModuleEnabled = isEnabledXRecommend(XRECOMMEND_ENABLED_KEY);
  if (isAuthenticated.value && isXRecommendModuleEnabled && !shouldHide("recently-browsed-products")) {
    recentlyBrowsedProducts.value = (await recentlyBrowsed())?.products || [];
  }
  if (isAuthenticated.value && !shouldHide("cart-for-later")) {
    await getSavedForLater();
  }
})();
</script>

<style lang="scss">
.cart {
  --vc-container-pt: theme("padding.5");
  --vc-container-pb: theme("padding.14");

  @apply relative;

  &--empty {
    --vc-container-pt: theme("padding.10");
    --vc-container-pb: theme("padding.24");

    .cart__title {
      @apply mb-6;
    }
  }

  &__breadcrumbs {
    @apply mb-3;

    @media (width < theme("screens.lg")) {
      @apply hidden;
    }
  }

  &__title {
    @apply mb-5;
  }

  &__empty {
    // The design gives this one plate a 40 inset on every side rather than the widget's own
    // 16/24/20 — it is the whole page rather than a section of one, and what it holds is
    // centred with nothing beside it (CartScreen.jsx, the empty branch).
    --vc-widget-padding-top: theme("padding.10");
    --vc-widget-padding-bottom: theme("padding.10");

    // Sideways it waits for the room, the way the widget's own inset does: the design draws
    // this plate at one desktop width and states the 40 inline, where no breakpoint can reach
    // it, but 40 a side on a 360 phone leaves 248 for a `lg` button that measures 252 in
    // English and more in German. Below `sm` the kit's own 16 stands.
    @media (width >= theme("screens.sm")) {
      --vc-widget-padding-x: theme("padding.10");
    }

    @apply text-center;
  }

  &__empty-hint {
    @apply mt-1 text-sm font-normal text-neutral-600;
  }

  &__empty-actions {
    // One gap, not two: the design spaces the pair the same however they wrap.
    @apply mt-6 flex flex-wrap justify-center gap-6;
  }

  &__section {
    @apply mt-5;
  }

  &__alert,
  &__action {
    @apply mt-3;
  }

  &__mobile-bar {
    @apply fixed bottom-0 start-0 z-10 w-full bg-additional-50 px-6 pb-5 pt-3;

    box-shadow:
      0 2px 10px 0 rgb(0 0 0 / 10%),
      0 0 25px -5px rgb(0 0 0 / 20%);

    @media (width >= theme("screens.md")) {
      @apply hidden;
    }

    @media print {
      @apply hidden;
    }
  }

  &__mobile-total {
    @apply text-end text-base font-bold text-neutral-950;
  }

  &__mobile-action {
    margin-top: theme("spacing.2") !important;
  }
}
</style>
