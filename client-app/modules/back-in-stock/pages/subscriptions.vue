<template>
  <div class="back-in-stock-subscriptions">
    <BackButtonInHeader v-if="isMobile" @click="$router.back" />

    <VcTypography tag="h1" class="back-in-stock-subscriptions__title">
      {{ $t("back_in_stock.subscriptions.meta.title") }}
    </VcTypography>

    <VcInput
      v-model="keywordInput"
      :disabled="allLoading"
      :placeholder="$t('back_in_stock.subscriptions.search_placeholder')"
      maxlength="64"
      clearable
      class="back-in-stock-subscriptions__keyword-input"
      @keydown.enter="applyKeyword"
      @clear="resetKeyword"
    >
      <template #append>
        <VcButton
          :aria-label="$t('back_in_stock.subscriptions.search_button')"
          :title="$t('back_in_stock.subscriptions.search_button')"
          :disabled="allLoading"
          icon="search"
          icon-size="1.25rem"
          @click="applyKeyword"
        />
      </template>
    </VcInput>

    <div ref="listElement">
      <template v-if="allLoading">
        <ProductSkeletonList v-for="index in actualItemsCount" :key="index" />
      </template>

      <template v-if="subscriptionsProducts.length">
        <VcLineItems
          class="back-in-stock-subscriptions__list"
          :items="preparedLineItems"
          with-image
          with-properties
          with-price
          @remove:items="openDeleteProductModal"
        >
          <template #default="{ item }">
            <template
              v-if="
                item.product && !isProductSubscriptionActive(item.product.id) && item.product.availabilityData.isInStock
              "
            >
              <AddToCart :product="item.product">
                <InStock
                  :is-in-stock="item.availabilityData?.isInStock"
                  :is-available="!item.deleted"
                  :quantity="item.availabilityData?.availableQuantity"
                  :is-digital="item.productType === ProductType.Digital"
                />

                <CountInCart :product-id="item.productId" />
              </AddToCart>
            </template>

            <BackInStockNotifyButton v-else-if="item.product" :product="item.product" lazy />
          </template>
        </VcLineItems>

        <VcPagination
          v-if="pagination.pages > 1"
          v-model:page="pagination.page"
          class="back-in-stock-subscriptions__pagination"
          :pages="Math.min(pagination.pages, PAGE_LIMIT)"
          :scroll-target="listElement"
          :scroll-offset="60"
        />
      </template>

      <VcEmptyView v-else-if="!allLoading" :text="$t('back_in_stock.list_details.empty_list')" icon="outline-lists">
        <template #button>
          <VcButton v-if="!!continue_shopping_link" :external-link="continue_shopping_link">
            {{ $t("back_in_stock.list_details.empty_list_button") }}
          </VcButton>

          <VcButton v-else to="/">
            {{ $t("back_in_stock.list_details.empty_list_button") }}
          </VcButton>
        </template>
      </VcEmptyView>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import keyBy from "lodash/keyBy";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { PAGE_LIMIT } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { ProductType } from "@/core/enums";
import { prepareLineItemForProduct } from "@/core/utilities";
import { dataChangedEvent, useBroadcast } from "@/shared/broadcast";
import { useShortCart, AddToCart } from "@/shared/cart";
import { InStock, CountInCart, useProducts, ProductSkeletonList } from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import { DeactivateBackInStockSubscriptionModal, BackInStockNotifyButton } from "../components";
import { useBackInStockSubscriptions } from "../composables";
import type { Product } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";

const { t } = useI18n();
const { openModal } = useModal();
const {
  fetchSubscriptions,
  fetching: subscriptionsFetching,
  subscriptions,
  pagination,
  isProductSubscriptionActive,
} = useBackInStockSubscriptions();

usePageHead({
  title: computed(() => t("back_in_stock.subscriptions.meta.title")),
});

const { fetchProducts, products, fetchingProducts } = useProducts();
const { loading: cartLoading, cart } = useShortCart();
const broadcast = useBroadcast();
const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

const listElement = ref<HTMLElement | undefined>();

const keywordInput = ref("");
const keyword = ref("");

const subscriptionsProducts = ref<Product[]>([]);
const cartItemsBySkus = computed(() => keyBy(cart.value?.items, "code"));
const preparedLineItems = computed<PreparedLineItemType[]>(() =>
  subscriptionsProducts.value.map((item) =>
    prepareLineItemForProduct(item, cartItemsBySkus.value[item.code]?.quantity),
  ),
);

const allLoading = computed<boolean>(() => subscriptionsFetching.value || fetchingProducts.value || cartLoading.value);

const actualItemsCount = computed<number>(() => preparedLineItems.value.length || pagination.value.itemsPerPage);

const fetchProductsAndSubscriptions = async () => {
  await fetchSubscriptions({ keyword: keyword.value });
  await fetchProducts({
    productIds: subscriptions.value.map((item) => item.productId),
    itemsPerPage: subscriptions.value.length,
  });
  subscriptionsProducts.value = subscriptions.value
    .map((subscription) => products.value.find((item) => item.id === subscription.productId))
    .filter((item): item is Product => item !== undefined);
};

function applyKeyword(): void {
  keyword.value = keywordInput.value;
  pagination.value.page = 1;
}
function resetKeyword(): void {
  keywordInput.value = "";
  applyKeyword();
}

function openDeleteProductModal(ids: string[]): void {
  const item = subscriptionsProducts.value?.find(({ id }) => ids.includes(id));
  if (!item) {
    return;
  }
  openModal({
    component: DeactivateBackInStockSubscriptionModal,
    props: {
      productId: item.id,
      productName: item.name,
      onResult(): void {
        const hasPagination = pagination.value.pages > 1;
        const isLastPage = pagination.value.page === pagination.value.pages;
        const isLastPageWithOneItem = isLastPage && pagination.value.totalCount % pagination.value.itemsPerPage === 1;
        if (hasPagination && isLastPageWithOneItem) {
          pagination.value.page -= 1;
        }
        // eslint-disable-next-line sonarjs/void-use
        void broadcast.emit(dataChangedEvent);
        void fetchProductsAndSubscriptions();
      },
    },
  });
}

watchEffect(fetchProductsAndSubscriptions);
</script>

<style lang="scss">
.back-in-stock-subscriptions {
  &__keyword-input {
    @apply mt-2 w-full;
  }

  &__list {
    @apply bg-additional-50;
  }

  &__pagination {
    @apply mt-5;
  }
}
</style>
