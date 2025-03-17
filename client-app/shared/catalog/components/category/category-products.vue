<template>
  <div>
    <template v-if="products.length || fetchingProducts">
      <div v-if="products.length && minVisitedPage && minVisitedPage > 1" class="my-5 text-center">
        <VcButton
          size="xs"
          variant="no-background"
          color="accent"
          :loading="fetchingMoreProducts"
          @click="$emit('previousPage')"
          >Load previous page</VcButton
        >
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
        v-if="!Number(fixedProductsCount)"
        :loading="fetchingProducts || fetchingMoreProducts"
        :is-page-limit-reached="pageNumber >= PAGE_LIMIT"
        :page-number="pageNumber"
        :pages-count="pagesCount"
        distance="400"
        class="mt-8"
        @visible="$emit('nextPage')"
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
import { toRef } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { PAGE_LIMIT } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import { AddToCart } from "@/shared/cart";
import type { Product } from "@/core/api/graphql/types";
import DisplayProducts from "@/shared/catalog/components/display-products.vue";

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

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
  pageNumber: number;
  products: Product[];
  savedViewMode: "grid" | "list";
  minVisitedPage?: number;
  maxVisitedPage?: number;
}

interface IEmits {
  (event: "resetFacetFilters"): void;
  (event: "previousPage"): void;
  (event: "nextPage"): void;
  (event: "selectProduct", product: Product): void;
  (event: "resetFilterKeyword"): void;
}

const keywordQueryParam = useRouteQueryParam<string>(QueryParamName.Keyword, {
  defaultValue: "",
});

const pageNumber = toRef(props, "pageNumber");

function sendGASelectItemEvent(product: Product): void {
  emit("selectProduct", product);
}
</script>
