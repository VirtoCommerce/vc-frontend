<template>
  <VcLoaderOverlay v-if="loading" no-bg />

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
    <VcLoaderOverlay :visible="isCartLoked" fixed-spinner />

    <template v-if="!hideHeader">
      <VcBreadcrumbs :items="breadcrumbs" class="max-lg:hidden" />

      <VcTypography tag="h1" class="mb-5">
        {{ $t("pages.cart.title") }}
      </VcTypography>
    </template>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <slot name="main" />

      <ProductsSection
        :grouped="!!$cfg.line_items_group_by_vendor_enabled"
        :items="cart.items"
        :items-grouped-by-vendor="lineItemsGroupedByVendor"
        :selected-item-ids="selectedItemIds"
        :validation-errors="cart.validationErrors"
        with-clear-cart
        :disabled="changeItemQuantityBatchedOverflowed || selectionOverflowed"
        @change:item-quantity="changeItemQuantityBatched($event.itemId, $event.quantity)"
        @select:items="handleSelectItems"
        @remove:items="handleRemoveItems"
        @clear:cart="openClearCartModal"
      />

      <GiftsSection
        v-if="$cfg.checkout_gifts_enabled && availableExtendedGifts.length"
        :gifts="availableExtendedGifts"
        @toggle:gift="toggleGift"
      />

      <!-- Sections for single page checkout -->
      <template v-if="!$cfg.checkout_multistep_enabled">
        <ShippingDetailsSection v-if="!allItemsAreDigital" />

        <BillingDetailsSection />

        <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" />
      </template>

      <RecentlyBrowsedProducts v-if="recentlyBrowsedProducts.length" :products="recentlyBrowsedProducts" />

      <template #sidebar>
        <slot name="sidebar" />

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
            >
              {{ $t("common.buttons.go_to_checkout") }}
            </ProceedTo>

            <PlaceOrder v-else />

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
          @lock-cart="isCartLoked = true"
          @unlock-cart="isCartLoked = false"
        />
      </template>
    </VcLayoutWithRightSidebar>

    <transition name="slide-fade-bottom">
      <div
        v-if="!isEmpty(selectedItemIds)"
        class="shadow-t-lgs fixed bottom-0 left-0 z-10 flex w-full justify-center bg-additional-50 p-6 md:hidden print:hidden"
      >
        <VcButton variant="outline" prepend-icon="trash" @click="handleRemoveItems(selectedItemIds)">
          {{ $t("common.buttons.remove_selected") }}
        </VcButton>
      </div>
    </transition>
  </VcContainer>
</template>

<script setup lang="ts">
import { isEmpty } from "lodash";
import { computed, inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { recentlyBrowsed } from "@/core/api/graphql";
import { useBreadcrumbs, useGoogleAnalytics, usePageHead } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
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

interface IProps {
  cartType?: string;
  cartName?: string;
  hideHeader?: boolean;
  hideQuoteWidget?: boolean;
}

const props = defineProps<IProps>();

const config = inject(configInjectionKey, {});

const ga = useGoogleAnalytics();
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
  ga.removeItemsFromCart(cart.value!.items!.filter((item) => itemIds.includes(item.id)));
}

function handleSelectItems(value: { itemIds: string[]; selected: boolean }) {
  if (!value.selected) {
    unselectCartItems(value.itemIds);
  } else {
    selectCartItems(value.itemIds);
  }
}

const cartVariables = computed(() => ({ cartType: props.cartType, cartName: props.cartName }));

void (async () => {
  await forceFetch(cartVariables.value);

  /**
   * Send a Google Analytics shopping cart view event.
   */
  if (cart.value) {
    ga.viewCart(cart.value);
  }

  if (!config.checkout_multistep_enabled) {
    await initialize();
  }

  if (isAuthenticated.value) {
    recentlyBrowsedProducts.value = (await recentlyBrowsed())?.products || [];
  }
})();
</script>
