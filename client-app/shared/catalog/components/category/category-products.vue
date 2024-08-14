<template>
  <div>
    <template v-if="products.length || fetchingProducts">
      <DisplayProducts
        :loading="fetchingProducts"
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
        v-if="!fetchingProducts && !Number(fixedProductsCount)"
        :loading="fetchingMoreProducts"
        distance="400"
        class="mt-8"
        :is-page-limit-reached="pageNumber === PAGE_LIMIT"
        @visible="$emit('changePage', ++pageNumber)"
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
          v-if="hasSelectedFacets || keywordQueryParam"
          prepend-icon="reset"
          @click="$emit('resetFilterKeyword')"
        >
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
import { AddToCart } from "@/shared/common";
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

const pageNumber = toRef(props, "pageNumber");

function sendGASelectItemEvent(product: Product): void {
  emit("selectProduct", product);
}
</script>
