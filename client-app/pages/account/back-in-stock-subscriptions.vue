<template>
  <div>
    <VcLoaderOverlay :visible="allLoading" fixed-spinner />

    <BackButtonInHeader v-if="isMobile" @click="$router.back" />

    <div class="flex flex-col">
      <!-- Title block -->
      <div class="contents md:flex md:flex-wrap md:items-center md:justify-between md:gap-3">
        <VcTypography tag="h1">
          {{ $t("shared.account.navigation.links.back_in_stock_subscriptions") }}
        </VcTypography>
      </div>

      <PageToolbarBlock
        :stick="stickyMobileHeaderIsVisible"
        class="mt-2 flex flex-row items-center gap-x-2 lg:flex-row-reverse lg:gap-x-5"
        shadow
      >
        <div class="flex grow">
          <VcInput
            v-model="keyword"
            :disabled="allLoading"
            :placeholder="$t('shared.back-in-stock.search_placeholder')"
            maxlength="64"
            class="w-full"
            @keydown.enter="applyKeyword"
          >
            <template #append>
              <button
                v-if="keyword"
                :aria-label="$t('quotes.reset_search')"
                type="button"
                class="flex h-full items-center px-4"
                @click="resetKeyword"
              >
                <VcIcon class="text-primary" name="delete-2" size="xs" />
              </button>

              <VcButton
                :aria-label="$t('shared.back-in-stock.search_placeholder')"
                :disabled="allLoading"
                icon="search"
                @click="applyKeyword"
              />
            </template>
          </VcInput>
        </div>
      </PageToolbarBlock>

      <div ref="listElement" class="mt-5 w-full">
        <!-- Skeletons -->
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

        <!-- List details -->
        <template v-if="!!subscriptionsItems.length && !allLoading">
          <VcWidget size="lg">
            <div class="flex flex-col gap-6">
              <BackInStockSubscriptionsLineItems
                :items="pagedListItems"
                :pending-items="pendingItems"
                @update:cart-item="addOrUpdateCartItem"
                @remove:items="openDeleteProductModal"
              />

              <p v-if="page >= PAGE_LIMIT" class="my-3 text-center">{{ $t("ui_kit.reach_limit.page_limit") }}</p>

              <VcPagination
                v-if="pagesCount > 1"
                v-model:page="page"
                :pages="Math.min(pagesCount, PAGE_LIMIT)"
                :scroll-target="listElement"
                :scroll-offset="60"
              />
            </div>
          </VcWidget>
        </template>

        <!-- Empty list -->
        <VcEmptyView
          v-else-if="!allLoading && subscriptionsItems.length === 0"
          :text="$t('shared.back-in-stock.list_details.empty_list')"
          icon="thin-lists"
        >
          <template #button>
            <VcButton :to="{ name: 'Catalog' }">
              {{ $t("shared.back-in-stock.list_details.empty_list_button") }}
            </VcButton>
          </template>
        </VcEmptyView>

        <Error404 v-else-if="!allLoading && !subscriptionsItems" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints, useElementVisibility } from "@vueuse/core";
import { keyBy } from "lodash";
import { computed, ref, watchEffect, defineAsyncComponent, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useGoogleAnalytics, useHistoricalEvents, usePageHead } from "@/core/composables";
import { PAGE_LIMIT } from "@/core/constants";
import { globals } from "@/core/globals";
import { prepareLineItemForProduct } from "@/core/utilities";
import { DeactivateBackInStockSubscriptionModal, useBackInStockSubscriptions } from "@/shared/back-in-stock";
import { useShortCart } from "@/shared/cart";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import { ProductSkeletonGrid, useProducts } from "../../shared/catalog";
import type { Product } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";
import BackInStockProductItemSkeleton from "@/shared/back-in-stock/components/back-in-stock-product-item-skeleton.vue";
import BackInStockSubscriptionsLineItems from "@/shared/back-in-stock/components/back-in-stock-subscriptions-line-items.vue";

const Error404 = defineAsyncComponent(() => import("../../pages/404.vue"));
const { t } = useI18n();
const ga = useGoogleAnalytics();
const { openModal } = useModal();
const {
  fetchSubscriptions,
  loading: subscriptionsLoading,
  backInStockSubscriptions,
  itemsPerPage,
  page,
  keyword,
} = useBackInStockSubscriptions();
const { fetchProducts, products, fetchingProducts } = useProducts();
const { loading: cartLoading, changing: cartChanging, cart, addToCart, changeItemQuantity } = useShortCart();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { pushHistoricalEvent } = useHistoricalEvents();
const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

usePageHead({
  title: computed(() => t("pages.account.back_in_stock_subscriptions.meta.title")),
});

const subscriptionsItems = ref<Product[]>([]);
const listElement = ref<HTMLElement | undefined>();
const pendingItems = ref<Record<string, boolean>>({});

const cartItemsBySkus = computed(() => keyBy(cart.value?.items, "code"));
const preparedLineItems = computed<PreparedLineItemType[]>(() =>
  subscriptionsItems.value.map((item) => prepareLineItemForProduct(item, cartItemsBySkus.value[item.code!]?.quantity)),
);

const allLoading = computed<boolean>(
  () => subscriptionsLoading.value || fetchingProducts.value || cartLoading.value || cartChanging.value,
);

const pagesCount = computed<number>(() => Math.ceil((subscriptionsItems.value.length ?? 0) / itemsPerPage.value));

const pagedListItems = computed<PreparedLineItemType[]>(() =>
  preparedLineItems.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value),
);

const actualPageRowsCount = computed<number>(() => pagedListItems.value.length || itemsPerPage.value);

const isMobile = breakpoints.smaller("lg");

const fetchProductsAndSubscriptions = async () => {
  await fetchSubscriptions({ isActive: true });
  if (backInStockSubscriptions.value.length > 0) {
    await fetchProducts({
      productIds: backInStockSubscriptions.value.map((item) => item.productId!),
      itemsPerPage: 10,
    });
    const productsResult: Product[] = [];
    page.value = 1;
    if (products.value.length > 0) {
      backInStockSubscriptions.value.forEach((subscription) => {
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

async function addOrUpdateCartItem(item: PreparedLineItemType, quantity: number): Promise<void> {
  const itemInCart = cart.value?.items?.find((cartItem) => cartItem.productId === item.id);
  if (pendingItems.value[item.id]) {
    return;
  }
  pendingItems.value[item.id] = true;
  if (itemInCart) {
    if (itemInCart.quantity !== quantity) {
      await changeItemQuantity(itemInCart.id, quantity);
    }
  } else {
    await addToCart(item.id, quantity);
    const product = products.value.find((pr) => pr.id === item.productId);
    if (product) {
      ga.addItemToCart(product, quantity);
    }
    void pushHistoricalEvent({
      eventType: "addToCart",
      sessionId: cart.value?.id,
      productId: item.id,
      storeId: globals.storeId,
    });
  }
  pendingItems.value[item.id] = false;
}

async function applyKeyword(): Promise<void> {
  page.value = 1;
  await fetchProductsAndSubscriptions();
}

async function resetKeyword(): Promise<void> {
  keyword.value = "";
  page.value = 1;
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
          if (previousPagesCount > 1 && previousPagesCount === page.value && previousPagesCount > pagesCount.value) {
            page.value -= 1;
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
