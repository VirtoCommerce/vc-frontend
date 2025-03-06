<template>
  <template v-if="!cart?.items?.length && !recentlyBrowsedProducts?.length">
    <VcLoaderOverlay v-if="loading" no-bg />

    <VcEmptyPage
      v-else
      :title="$t('pages.cart.title')"
      image="basket.jpg"
      icon="outline-cart"
      :breadcrumbs="breadcrumbs"
    >
      <div class="mb-6 text-lg font-bold">
        {{ $t("pages.cart.empty_cart_description") }}
      </div>

      <div class="flex flex-wrap gap-x-6 gap-y-2.5 max-sm:justify-center">
        <VcButton v-if="!!continue_shopping_link" :external-link="continue_shopping_link" prepend-icon="shopping-bag">
          {{ $t("common.buttons.continue_shopping") }}
        </VcButton>

        <VcButton v-else to="/" prepend-icon="shopping-bag">
          {{ $t("common.buttons.continue_shopping") }}
        </VcButton>

        <VcButton :to="{ name: 'BulkOrder' }" prepend-icon="bulk">
          {{ $t("common.buttons.add_with_bulk_order") }}
        </VcButton>
      </div>
    </VcEmptyPage>
  </template>

  <VcContainer v-else class="relative z-0 max-lg:pb-12">
    <VcLoaderOverlay :visible="isCartLoked" fixed-spinner />

    <VcBreadcrumbs :items="breadcrumbs" class="max-lg:hidden" />

    <VcTypography tag="h1" class="mb-5">
      {{ $t("pages.cart.title") }}
    </VcTypography>

    <template v-if="!cart?.items?.length">
      <VcWidget class="mb-10 mt-8" size="lg">
        <div class="text-lg font-bold">
          {{ $t("pages.cart.empty_cart_description") }}
        </div>

        <div class="mt-1 text-sm font-normal">{{ $t("pages.cart.empty_cart_search_text") }}</div>

        <div class="mt-6 flex flex-wrap gap-x-6 gap-y-2.5 max-sm:justify-center">
          <VcButton v-if="!!continue_shopping_link" :external-link="continue_shopping_link">
            {{ $t("common.buttons.continue_shopping") }}
          </VcButton>

          <VcButton v-else to="/">
            {{ $t("common.buttons.continue_shopping") }}
          </VcButton>

          <VcButton :to="{ name: 'BulkOrder' }" prepend-icon="bulk">
            {{ $t("common.buttons.add_with_bulk_order") }}
          </VcButton>
        </div>
      </VcWidget>

      <RecentlyBrowsedProducts v-if="recentlyBrowsedProducts.length" :products="recentlyBrowsedProducts" class="mt-5" />
    </template>

    <template v-else>
      <VcLayout sidebar-position="right" sticky-sidebar>
        <ProductsSection
          :grouped="!!$cfg.line_items_group_by_vendor_enabled"
          :items="cart.items"
          :items-grouped-by-vendor="lineItemsGroupedByVendor"
          :selected-item-ids="selectedItemIds"
          :validation-errors="cart.validationErrors"
          :disabled="changeItemQuantityBatchedOverflowed || selectionOverflowed"
          @change:item-quantity="changeItemQuantityBatched($event.itemId, $event.quantity)"
          @select:items="handleSelectItems"
          @remove:items="handleRemoveItems"
          @clear:cart="openClearCartModal"
        />

        <GiftsSection
          v-if="$cfg.checkout_gifts_enabled && availableExtendedGifts.length"
          :gifts="availableExtendedGifts"
          class="mt-5"
          @toggle:gift="toggleGift"
        />

        <!-- Sections for single page checkout -->
        <template v-if="!$cfg.checkout_multistep_enabled">
          <ShippingDetailsSection v-if="!allItemsAreDigital" class="mt-5" />

          <BillingDetailsSection class="mt-5" />

          <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" class="mt-5" />
        </template>

        <RecentlyBrowsedProducts
          v-if="recentlyBrowsedProducts.length"
          :products="recentlyBrowsedProducts"
          class="mt-5"
        />

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
                class="mt-4"
                @apply="applyCoupon"
                @deny="removeCoupon"
                @update:model-value="clearCouponValidationError"
              />

              <ProceedTo
                v-if="$cfg.checkout_multistep_enabled"
                :to="{ name: 'Checkout' }"
                :disabled="hasOnlyUnselectedLineItems"
                class="mt-4"
              >
                {{ $t("common.buttons.go_to_checkout") }}
              </ProceedTo>

              <PlaceOrder v-else class="mt-4" />

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

          <component
            :is="item.element"
            v-for="item in sidebarWidgets"
            :key="item.id"
            class="mt-5"
            @lock-cart="isCartLoked = true"
            @unlock-cart="isCartLoked = false"
          />
        </template>
      </VcLayout>

      <transition name="slide-fade-bottom">
        <div
          v-if="!loading && cart?.items?.length"
          class="fixed bottom-0 left-0 z-10 w-full bg-additional-50 px-6 pb-5 pt-3 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.1),0px_0px_25px_-5px_rgba(0,0,0,0.2)] md:hidden print:hidden"
        >
          <div class="text-end text-base font-bold text-neutral-950">
            <span class="me-1">{{ $t("common.labels.total") }}:</span>
            <VcPriceDisplay v-if="cart.total" :value="cart.total" />
          </div>

          <ProceedTo
            v-if="$cfg.checkout_multistep_enabled"
            :to="{ name: 'Checkout' }"
            :disabled="hasOnlyUnselectedLineItems"
            class="!mt-2"
          >
            {{ $t("common.buttons.go_to_checkout") }}
          </ProceedTo>

          <PlaceOrder v-else class="!mt-2" />
        </div>
      </transition>
    </template>
  </VcContainer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { recentlyBrowsed } from "@/core/api/graphql";
import { useBreadcrumbs, useAnalytics, usePageHead, useThemeContext } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID_XRECOMMEND, XRECOMMEND_ENABLED_KEY, MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { useUser } from "@/shared/account";
import { useFullCart, useCoupon } from "@/shared/cart";
import { useCartExtensionPoints } from "@/shared/cart/composables/useCartExtensionPoints";
import {
  BillingDetailsSection,
  OrderCommentSection,
  OrderSummary,
  PlaceOrder,
  ProceedTo,
  ShippingDetailsSection,
  useCheckout,
} from "@/shared/checkout";
import type { Product } from "@/core/api/graphql/types";
import GiftsSection from "@/shared/cart/components/gifts-section.vue";
import ProductsSection from "@/shared/cart/components/products-section.vue";
import RecentlyBrowsedProducts from "@/shared/catalog/components/recently-browsed-products.vue";

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
} = useFullCart();
const { loading: loadingCheckout, comment, isValidShipment, isValidPayment, initialize } = useCheckout();
const { couponCode, couponIsApplied, couponValidationError, applyCoupon, removeCoupon, clearCouponValidationError } =
  useCoupon();

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});
const { isEnabled: isEnabledXRecommend } = useModuleSettings(MODULE_ID_XRECOMMEND);

const { sidebarWidgets } = useCartExtensionPoints();

usePageHead({
  title: t("pages.cart.meta.title"),
});

const breadcrumbs = useBreadcrumbs([{ title: t("common.links.cart"), route: { name: "Cart" } }]);

const isCartLoked = ref(false);
const recentlyBrowsedProducts = ref<Product[]>([]);

const loading = computed(() => loadingCart.value || loadingCheckout.value);
const isShowIncompleteDataWarning = computed(
  () => (!allItemsAreDigital.value && !isValidShipment.value) || !isValidPayment.value,
);

async function handleRemoveItems(itemIds: string[]): Promise<void> {
  await removeItems(itemIds);

  /**
   * Send Google Analytics event for an item was removed from cart.
   */
  analytics(
    "removeItemsFromCart",
    cart.value!.items!.filter((item) => itemIds.includes(item.id)),
  );
}

function handleSelectItems(value: { itemIds: string[]; selected: boolean }) {
  if (!value.selected) {
    unselectCartItems(value.itemIds);
  } else {
    selectCartItems(value.itemIds);
  }
}

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
  if (isAuthenticated.value && isXRecommendModuleEnabled) {
    recentlyBrowsedProducts.value = (await recentlyBrowsed())?.products || [];
  }
})();
</script>
