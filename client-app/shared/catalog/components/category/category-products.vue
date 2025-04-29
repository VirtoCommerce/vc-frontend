<template>
  <div class="category-products">
    <template v-if="products.length || fetchingProducts">
      <div
        :class="[
          'category-products__list',
          {
            'category-products__list--list': savedViewMode === 'list',
            'category-products__list--grid': savedViewMode === 'grid',
          },
        ]"
      >
        <template v-if="fetchingProducts">
          <component :is="skeletonComponent" v-for="i in itemsPerPage" :key="i" />
        </template>

        <template v-else>
          <ProductCard
            v-for="(item, index) in products"
            :key="index"
            :loading="fetchingProducts"
            :view-mode="savedViewMode"
            :lazy="index >= lazyCardsCount"
            :product="item"
            :browser-target="$cfg.details_browser_target"
            :card-type="cardType"
            @link-click="sendGASelectItemEvent"
          />
        </template>
      </div>

      <VcInfinityScrollLoader
        v-if="!Number(fixedProductsCount)"
        :loading="fetchingProducts || fetchingMoreProducts"
        :is-page-limit-reached="pageNumber >= PAGE_LIMIT"
        :page-number="pageNumber"
        :pages-count="pagesCount"
        distance="400"
        class="category-products__infinity"
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
import { useBreakpoints } from "@vueuse/core";
import { toRef, computed } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { PAGE_LIMIT, BREAKPOINTS, DEFAULT_PAGE_SIZE } from "@/core/constants";
import { QueryParamName } from "@/core/enums";
import { ProductCard, ProductSkeletonGrid, ProductSkeletonList } from "@/shared/catalog/components";
import type { Product } from "@/core/api/graphql/types";

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  itemsPerPage: DEFAULT_PAGE_SIZE,
  viewMode: "grid",
  columnsAmountTablet: "3",
  columnsAmountDesktop: "4",
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
  itemsPerPage?: number;
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

const breakpoints = useBreakpoints(BREAKPOINTS);

const skeletonComponent = computed(() => (props.savedViewMode === "list" ? ProductSkeletonList : ProductSkeletonGrid));

const columns = computed(() => ({
  null: 1,
  xs: 2,
  md: Number(props.columnsAmountTablet),
  xl: Number(props.columnsAmountDesktop),
}));

const lazyCardsCount = computed(() => {
  if (props.savedViewMode === "grid") {
    return getGridLazyCardsCount();
  }
  if (props.savedViewMode == "list") {
    return getListLazyCardsCount();
  }
  return 0;
});

function getGridLazyCardsCount() {
  const rowCount = 2;
  if (breakpoints.isSmaller("xs")) {
    return columns.value.null;
  }
  if (breakpoints.isInBetween("xs", "md")) {
    return columns.value.xs * rowCount;
  }
  if (breakpoints.isInBetween("md", "xl")) {
    return columns.value.md * rowCount;
  }
  if (breakpoints.isGreaterOrEqual("xl")) {
    return columns.value.xl * rowCount;
  }
  return 0;
}

function getListLazyCardsCount() {
  if (breakpoints.isSmaller("xs")) {
    return 2;
  }
  if (breakpoints.isInBetween("xs", "sm")) {
    return 4;
  }
  if (breakpoints.isInBetween("sm", "lg")) {
    return 6;
  }
  if (breakpoints.isInBetween("lg", "2xl")) {
    return 4;
  }
  if (breakpoints.isGreaterOrEqual("2xl")) {
    return 5;
  }
  return 0;
}

function sendGASelectItemEvent(product: Product): void {
  emit("selectProduct", product);
}
</script>

<style lang="scss">
.category-products {
  --vc-product-title-font-size: theme("fontSize.sm");
  --columnsAmountTablet: v-bind(props.columnsAmountTablet);
  --columnsAmountDesktop: v-bind(props.columnsAmountDesktop);

  &__list {
    &--grid {
      @apply grid gap-5;

      @media (min-width: theme("screens.xs")) {
        @apply grid-cols-2;
      }

      @media (min-width: theme("screens.md")) {
        grid-template-columns: repeat(var(--columnsAmountTablet), minmax(0, 1fr));
      }

      @media (min-width: theme("screens.xl")) {
        grid-template-columns: repeat(var(--columnsAmountDesktop), minmax(0, 1fr));
      }
    }

    &--list {
      @apply -mx-5 divide-y space-y-2;

      @media (min-width: theme("screens.md")) {
        @apply divide-y-0 mx-0 space-y-3.5;
      }
    }
  }

  &__infinity {
    @apply mt-8;
  }
}
</style>
