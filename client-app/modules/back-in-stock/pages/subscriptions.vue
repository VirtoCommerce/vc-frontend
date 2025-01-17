<template>
  <div>
    <VcLoaderOverlay :visible="allLoading" fixed-spinner />

    <BackButtonInHeader v-if="isMobile" @click="$router.back" />

    <div class="flex flex-col">
      <div class="contents md:flex md:flex-wrap md:items-center md:justify-between md:gap-3">
        <VcTypography tag="h1">
          {{ $t("back_in_stock.subscriptions.meta.title") }}
        </VcTypography>
      </div>

      <PageToolbarBlock
        :stick="stickyMobileHeaderIsVisible"
        class="mt-2 flex flex-row items-center gap-x-2 lg:flex-row-reverse lg:gap-x-5"
        shadow
      >
        <div class="flex grow">
          <VcInput
            v-model="fetchParameters.keyword"
            :disabled="allLoading"
            :placeholder="$t('back_in_stock.subscriptions.search_placeholder')"
            maxlength="64"
            class="w-full"
            @keydown.enter="applyKeyword"
          >
            <template #append>
              <button
                v-if="fetchParameters.keyword"
                :aria-label="$t('quotes.reset_search')"
                type="button"
                class="flex h-full items-center px-4"
                @click="resetKeyword"
              >
                <VcIcon class="text-primary" name="delete-2" size="xs" />
              </button>

              <VcButton
                :aria-label="$t('shared.back_in_stock.search_placeholder')"
                :disabled="allLoading"
                icon="search"
                @click="applyKeyword"
              />
            </template>
          </VcInput>
        </div>
      </PageToolbarBlock>

      <div ref="listElement" class="mt-5 w-full">
        <template v-if="allLoading">
          <div v-if="isMobile" class="grid grid-cols-2 gap-x-4 gap-y-6">
            <ProductSkeletonGrid v-for="index in actualPageRowsCount" :key="index" />
          </div>

          <div v-else class="flex flex-col rounded border bg-additional-50 shadow-sm">
            <BackInStockProductItemSkeleton
              v-for="index in actualPageRowsCount"
              :key="index"
              class="even:bg-neutral-50"
            />
          </div>
        </template>

        <template v-if="!!subscriptionsItems.length && !allLoading">
          <VcWidget size="lg">
            <div class="flex flex-col gap-6">
              <VcLineItems
                :items="preparedLineItems"
                with-image
                with-properties
                with-price
                removable
                @remove:items="openDeleteProductModal"
              >
                <template #default="{ item }">
                  <AddToCart :product="item" />
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
                v-if="pagesCount > 1"
                v-model:page="pagination.page"
                :pages="Math.min(pagesCount, PAGE_LIMIT)"
                :scroll-target="listElement"
                :scroll-offset="60"
              />
            </div>
          </VcWidget>
        </template>

        <VcEmptyView
          v-else-if="!allLoading && subscriptionsItems.length === 0"
          :text="$t('back_in_stock.list_details.empty_list')"
          icon="thin-lists"
        >
          <template #button>
            <VcButton :to="{ name: 'Catalog' }">
              {{ $t("back_in_stock.list_details.empty_list_button") }}
            </VcButton>
          </template>
        </VcEmptyView>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints, useElementVisibility } from "@vueuse/core";
import { keyBy } from "lodash";
import { computed, ref, watchEffect, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { PAGE_LIMIT } from "@/core/constants";
import { ProductType } from "@/core/enums";
import { prepareLineItemForProduct } from "@/core/utilities";
import { useShortCart, AddToCart } from "@/shared/cart";
import { InStock, CountInCart, ProductSkeletonGrid, useProducts } from "@/shared/catalog";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import { BackInStockProductItemSkeleton, DeactivateBackInStockSubscriptionModal } from "../components";
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
  fetchParameters,
} = useBackInStockSubscriptions();
const { fetchProducts, products, fetchingProducts } = useProducts();
const { loading: cartLoading, changing: cartChanging, cart } = useShortCart();
const breakpoints = useBreakpoints(breakpointsTailwind);

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);
usePageHead({
  title: computed(() => t("pages.account.back_in_stock_subscriptions.meta.title")),
});

const subscriptionsItems = ref<Product[]>([]);
const listElement = ref<HTMLElement | undefined>();
const cartItemsBySkus = computed(() => keyBy(cart.value?.items, "code"));
const preparedLineItems = computed<PreparedLineItemType[]>(() =>
  subscriptionsItems.value.map((item) => prepareLineItemForProduct(item, cartItemsBySkus.value[item.code!]?.quantity)),
);
const allLoading = computed<boolean>(
  () => subscriptionsFetching.value || fetchingProducts.value || cartLoading.value || cartChanging.value,
);
const pagesCount = computed<number>(() =>
  Math.ceil((subscriptionsItems.value.length ?? 0) / pagination.value.itemsPerPage),
);

const actualPageRowsCount = computed<number>(() => preparedLineItems.value.length || pagination.value.itemsPerPage);
const isMobile = breakpoints.smaller("lg");

const fetchProductsAndSubscriptions = async () => {
  await fetchSubscriptions({ isActive: true });
  if (subscriptions.value.length > 0) {
    await fetchProducts({
      productIds: subscriptions.value.map((item) => item.productId!),
      itemsPerPage: 10,
    });
    const productsResult: Product[] = [];
    pagination.value.page = 1;
    if (products.value.length > 0) {
      subscriptions.value.forEach((subscription) => {
        if (subscription.isActive) {
          const product = products.value.filter((item) => item.id === subscription.productId)[0];
          if (product) {
            productsResult.push(product);
          }
        }
      });
    }
    subscriptionsItems.value = productsResult;
  }
};

async function applyKeyword(): Promise<void> {
  pagination.value.page = 1;
  await fetchProductsAndSubscriptions();
}
async function resetKeyword(): Promise<void> {
  fetchParameters.value.keyword = "";
  pagination.value.page = 1;
  await applyKeyword();
}
function openDeleteProductModal(values: string[]): void {
  const item = subscriptionsItems.value?.find((i) => values.includes(i.id));
  if (item) {
    openModal({
      component: DeactivateBackInStockSubscriptionModal,
      props: {
        productId: item.id,
        productName: item.name,
        onResult(): void {
          const previousPagesCount = pagesCount.value;
          if (
            previousPagesCount > 1 &&
            previousPagesCount === pagination.value.page &&
            previousPagesCount > pagesCount.value
          ) {
            pagination.value.page -= 1;
          }
          fetchProductsAndSubscriptions();
        },
      },
    });
  }
}
watchEffect(async () => {
  await fetchProductsAndSubscriptions();
});
</script>
