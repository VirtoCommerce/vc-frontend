<template>
  <div>
    <template v-if="products.length || fetchingProducts">
      <div v-if="mode === CATALOG_MODES.loadMoreButtons && minVisitedPage > 1" class="mb-4 flex justify-center">
        <VcButton
          v-if="products.length"
          :loading="fetchingMoreProducts && pageNumber < minVisitedPage"
          prepend-icon="arrow-left"
          @click="loadPreviousPage"
        >
          {{ $t("pages.catalog.load_previous_page") }}
        </VcButton>
      </div>

      <DisplayProducts
        :loading="fetchingProducts"
        :view-mode="savedViewMode"
        :items-per-page="itemsPerPage"
        :products="products"
        :browser-target="$cfg.details_browser_target"
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
        v-if="mode === CATALOG_MODES.infiniteScroll && !Number(fixedProductsCount)"
        :loading="fetchingProducts || fetchingMoreProducts"
        :is-page-limit-reached="pageNumber >= PAGE_LIMIT"
        :page-number="pageNumber"
        :pages-count="pagesCount"
        distance="400"
        class="mt-8"
        @visible="$emit('changePage', pageNumber + 1)"
      />

      <div
        v-if="mode === CATALOG_MODES.loadMoreButtons && maxVisitedPage < pagesCount"
        class="mt-4 flex justify-center"
      >
        <VcButton
          :loading="fetchingMoreProducts && pageNumber > maxVisitedPage"
          append-icon="arrow-right"
          @click="loadNextPage"
        >
          {{ $t("pages.catalog.load_next_page") }}
        </VcButton>
      </div>

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
      icon="outline-stock"
    >
      <template v-if="hasSelectedFacets || keywordQueryParam" #button>
        <VcButton prepend-icon="reset" @click="$emit('resetFilterKeyword')">
          {{ $t("pages.catalog.no_products_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { PAGE_LIMIT } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import { AddToCart } from "@/shared/cart";
import { CATALOG_MODES } from "@/shared/catalog/constants/catalog";
import type { Product } from "@/core/api/graphql/types";
import type { CatalogModeType } from "@/shared/catalog/types/catalog";
import DisplayProducts from "@/shared/catalog/components/display-products.vue";

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: CATALOG_MODES.infiniteScroll,
});

interface IProps {
  cardType?: "full" | "short";
  columnsAmountDesktop?: string;
  columnsAmountTablet?: string;
  fetchingMoreProducts: boolean;
  fetchingProducts: boolean;
  fixedProductsCount?: number;
  hasActiveFilters: boolean;
  hasSelectedFacets: boolean;
  itemsPerPage: number;
  pagesCount: number;
  pageHistory: Readonly<number[]>;
  pageNumber: number;
  products: Product[];
  savedViewMode: "grid" | "list";
  mode?: CatalogModeType;
}

interface IEmits {
  (event: "resetFacetFilters"): void;
  (event: "changePage", pageNumber: number): void;
  (event: "selectProduct", product: Product): void;
  (event: "resetFilterKeyword"): void;
}

const keywordQueryParam = useRouteQueryParam<string>(QueryParamName.Keyword, {
  defaultValue: "",
});

function loadPreviousPage() {
  emit("changePage", minVisitedPage.value - 1);
}

function loadNextPage() {
  emit("changePage", maxVisitedPage.value + 1);
}

const pageNumber = toRef(props, "pageNumber");
const pageHistory = toRef(props, "pageHistory");

const minVisitedPage = computed(() => Math.min(...pageHistory.value));
const maxVisitedPage = computed(() => Math.max(...pageHistory.value));

function sendGASelectItemEvent(product: Product): void {
  emit("selectProduct", product);
}
</script>
