<template>
  <div>
    <template v-if="products.length || loading">
      <DisplayProducts
        :loading="loading"
        :view-mode="savedViewMode"
        :items-per-page="itemsPerPage"
        :products="products"
        :open-product-in-new-tab="$cfg.show_details_in_separate_tab"
        :card-type="cardType"
        :columns-amount-desktop="columnsAmountDesktop"
        :columns-amount-tablet="columnsAmountTablet"
        @item-link-click="sendGASelectItemEvent"
      >
        <template #cart-handler="{ item }">
          <AddToCart :product="item" :reserved-space="savedViewMode === 'grid'" />
        </template>
      </DisplayProducts>

      <VcInfinityScrollLoader
        v-if="!loading && !Number(fixedProductsCount)"
        :loading="loadingMore"
        distance="400"
        class="mt-8"
        :is-page-limit-reached="page === PAGE_LIMIT"
        @visible="loadMoreProducts"
      />

      <VcScrollTopButton />
    </template>

    <!-- Empty view -->
    <VcEmptyView
      v-else
      :text="
        hasActiveFilters || keywordQueryParam
          ? $t('pages.catalog.no_products_filtered_message')
          : $t('pages.catalog.no_products_message')
      "
      class="h-96"
    >
      <template #icon>
        <VcImage src="/static/images/common/stock.svg" :alt="$t('pages.catalog.products_icon')" />
      </template>

      <template #button>
        <VcButton
          v-if="isExistSelectedFacets || keywordQueryParam"
          prepend-icon="reset"
          @click="resetFacetFiltersWithKeyword"
        >
          {{ $t("pages.catalog.no_products_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import { computed, ref } from "vue";
import { useRouteQueryParam, useGoogleAnalytics } from "@/core/composables";
import { PAGE_LIMIT } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import { AddToCart } from "@/shared/cart";
import { useCategory } from "@/shared/catalog/composables/useCategory";
import { useProducts } from "@/shared/catalog/composables/useProducts";
import type { Product } from "@/core/api/graphql/types";
import type { ProductsSearchParams } from "@/shared/catalog";
import DisplayProducts from "@/shared/catalog/components/display-products.vue";

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

interface IProps {
  isExistSelectedFacets: boolean;
  hasActiveFilters: boolean;
  fixedProductsCount?: string;
  savedViewMode: "grid" | "list";
  itemsPerPage: number;
  cardType?: "full" | "short";
  columnsAmountDesktop?: string;
  columnsAmountTablet?: string;
  searchParams: ProductsSearchParams;
}

interface IEmits {
  (event: "resetFacetFilters"): void;
}

const ga = useGoogleAnalytics();
const { loading, loadingMore, products, fetchMoreProducts, pages, fetchProducts } = useProducts({
  withFacets: true,
});
const { category: currentCategory } = useCategory();

const keywordQueryParam = useRouteQueryParam<string>(QueryParamName.Keyword, {
  defaultValue: "",
});
const page = ref(1);

async function loadMoreProducts() {
  if (page.value === pages.value) {
    return;
  }

  const nextPage = page.value + 1;

  page.value = nextPage;

  await fetchMoreProducts({
    ...props.searchParams,
    page: nextPage,
  });

  /**
   * Send Google Analytics event for products on next page.
   */
  ga.viewItemList(products.value, {
    item_list_id: `${currentCategory.value?.slug}_page_${nextPage}`,
    item_list_name: `${currentCategory.value?.name} (page ${nextPage})`,
  });
}

function sendGASelectItemEvent(product: Product) {
  ga.selectItem(product);
}

function resetFacetFiltersWithKeyword() {
  keywordQueryParam.value = "";
  // FIXME: `setTimeout` is a hack to apply the value of `useRouteQueryParam` in parallel
  setTimeout(() => {
    emit("resetFacetFilters");
  }, 0);
}

async function loadProducts() {
  page.value = 1;

  await fetchProducts(props.searchParams);

  /**
   * Send Google Analytics event for products.
   */
  ga.viewItemList(products.value, {
    item_list_id: currentCategory.value?.slug,
    item_list_name: currentCategory.value?.name,
  });
}

watchDebounced(
  computed(() => JSON.stringify(props.searchParams)),
  loadProducts,
  {
    immediate: true,
    flush: "post",
    debounce: 20,
  },
);
</script>
