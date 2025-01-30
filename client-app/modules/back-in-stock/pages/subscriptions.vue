<template>
  <div class="back-in-stock-subscriptions">
    <BackButtonInHeader v-if="isMobile" @click="$router.back" />

    <VcTypography tag="h1" class="back-in-stock-subscriptions__title">
      {{ $t("back_in_stock.subscriptions.meta.title") }}
    </VcTypography>

    <PageToolbarBlock :stick="stickyMobileHeaderIsVisible" class="back-in-stock-subscriptions__toolbar" shadow>
      <VcInput
        v-model="keywordInput"
        :disabled="allLoading"
        :placeholder="$t('back_in_stock.subscriptions.search_placeholder')"
        maxlength="64"
        class="back-in-stock-subscriptions__keyword-input"
        @keydown.enter="applyKeyword"
      >
        <template #append>
          <button
            v-if="keyword"
            :aria-label="$t('back_in_stock.subscriptions.reset_search')"
            :title="$t('back_in_stock.subscriptions.reset_search')"
            type="button"
            class="flex h-full items-center px-4"
            :disabled="allLoading"
            @click="resetKeyword"
          >
            <VcIcon class="text-primary" name="delete-2" size="xs" />
          </button>

          <VcButton
            :aria-label="$t('back_in_stock.subscriptions.search_button')"
            :title="$t('back_in_stock.subscriptions.search_button')"
            :disabled="allLoading"
            icon="search"
            @click="applyKeyword"
          />
        </template>
      </VcInput>
    </PageToolbarBlock>

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
            <AddToCart v-if="item.product" :product="item.product" />
            <InStock
              :is-in-stock="item.availabilityData?.isInStock"
              :is-available="!item.deleted"
              :quantity="item.availabilityData?.availableQuantity"
              :is-digital="item.productType === ProductType.Digital"
            />

            <CountInCart :product-id="item.productId" />
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

      <VcEmptyView v-else-if="!allLoading" :text="$t('back_in_stock.list_details.empty_list')" icon="thin-lists">
        <template #button>
          <VcButton :to="{ name: 'Catalog' }">
            {{ $t("back_in_stock.list_details.empty_list_button") }}
          </VcButton>
        </template>
      </VcEmptyView>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints, useElementVisibility } from "@vueuse/core";
import keyBy from "lodash/keyBy";
import { computed, ref, watchEffect, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { PAGE_LIMIT } from "@/core/constants";
import { ProductType } from "@/core/enums";
import { prepareLineItemForProduct } from "@/core/utilities";
import { PageToolbarBlock } from "@/shared/account";
import { dataChangedEvent, useBroadcast } from "@/shared/broadcast";
import { useShortCart, AddToCart } from "@/shared/cart";
import { InStock, CountInCart, useProducts, ProductSkeletonList } from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import { DeactivateBackInStockSubscriptionModal } from "../components";
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
} = useBackInStockSubscriptions();

usePageHead({
  title: computed(() => t("back_in_stock.subscriptions.meta.title")),
});

const { fetchProducts, products, fetchingProducts } = useProducts();
const { loading: cartLoading, cart } = useShortCart();
const broadcast = useBroadcast();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const listElement = ref<HTMLElement | undefined>();
const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

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
    productIds: subscriptions.value.map((item) => item.productId!),
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
  &__toolbar {
    @apply mt-2  flex flex-row items-center gap-x-2 lg:flex-row-reverse lg:gap-x-5;
  }

  &__keyword-input {
    @apply w-full;
  }

  &__list {
    @apply bg-additional-50;
  }

  &__pagination {
    @apply mt-5;
  }
}
</style>
