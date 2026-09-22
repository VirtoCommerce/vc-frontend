<template>
  <div class="category-products">
    <template v-if="products.length || fetchingProducts">
      <div
        v-if="mode === CATALOG_PAGINATION_MODES.loadMore && minVisitedPage > 1"
        class="category-products__pagination category-products__pagination--previous"
      >
        <VcButton
          v-if="products.length"
          class="category-products__load-button"
          size="sm"
          :loading="fetchingMoreProducts && pageNumber < minVisitedPage"
          prepend-icon="arrow-left"
          @click="loadPreviousPage"
        >
          {{ $t("pages.catalog.load_previous_page") }}
        </VcButton>
      </div>

      <div
        ref="grid"
        :class="`category-products__list category-products__list--${displayedViewMode}`"
        :data-test-id="`products-${displayedViewMode}-view`"
      >
        <template v-if="fetchingProducts && !holdingCards">
          <component :is="skeletonComponent" v-for="i in itemsPerPage" :key="i" />
        </template>

        <template v-else>
          <!-- Keyed by seat, not by product: the card that turns has to be the same element on the
               way back, and a key that moves with the product would replace it mid-turn. -->
          <ProductCard
            v-for="(item, index) in displayedProducts"
            :key="index"
            :loading="false"
            :view-mode="displayedViewMode"
            :lazy="index >= lazyCardsCount"
            :product="item"
            :browser-target="browserTarget"
            :card-type="cardType"
            @link-click="sendGASelectItemEvent"
          />
        </template>
      </div>

      <VcInfinityScrollLoader
        v-if="mode === CATALOG_PAGINATION_MODES.infiniteScroll && !Number(fixedProductsCount)"
        :loading="fetchingProducts || fetchingMoreProducts"
        :is-page-limit-reached="pageNumber >= PAGE_LIMIT"
        :page-number="pageNumber"
        :pages-count="pagesCount"
        test-id="category-endless-scroll-loader"
        distance="400"
        class="category-products__infinity"
        @visible="$emit('changePage', pageNumber + 1)"
      />

      <div
        v-if="mode === CATALOG_PAGINATION_MODES.loadMore && maxVisitedPage < pagesCount"
        class="category-products__pagination category-products__pagination--next"
      >
        <VcButton
          :loading="fetchingMoreProducts && pageNumber > maxVisitedPage"
          append-icon="arrow-right"
          size="sm"
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
        hasActiveFilters || keyword
          ? $t('pages.catalog.no_products_filtered_message')
          : $t('pages.catalog.no_products_message')
      "
      icon="outline-stock"
      :variant="hasActiveFilters || keyword ? 'search' : 'empty'"
    >
      <template v-if="hasActiveFilters || keyword" #button>
        <VcButton prepend-icon="reset" @click="$emit('resetFilterKeyword')">
          {{ $t("pages.catalog.no_products_button") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints } from "@vueuse/core";
import { computed, onMounted, ref, toRef, useTemplateRef, watch } from "vue";
import { useBrowserTarget } from "@/core/composables";
import { DEFAULT_PAGE_SIZE, PAGE_LIMIT } from "@/core/constants";
import { ProductCard, ProductSkeletonGrid, ProductSkeletonList } from "@/shared/catalog/components";
import { useCatalogGridMotion } from "@/shared/catalog/composables/useCatalogGridMotion";
import { CATALOG_PAGINATION_MODES } from "@/shared/catalog/constants/catalog";
import { BREAKPOINTS } from "@/ui-kit/constants";
import type { Product } from "@/core/api/graphql/types";
import type { CatalogPaginationModeType } from "@/shared/catalog/types/catalog";

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  mode: CATALOG_PAGINATION_MODES.infiniteScroll,
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
  keyword?: string;
  itemsPerPage?: number;
  pagesCount: number;
  pageHistory: Readonly<number[]>;
  pageNumber: number;
  products: Product[];
  savedViewMode: "grid" | "list";
  /** Bumped when a sorting is pressed. A change to it is what arms the flip. */
  sortToken?: number;
  mode?: CatalogPaginationModeType;
}

interface IEmits {
  (event: "changePage", pageNumber: number): void;
  (event: "selectProduct", product: Product): void;
  (event: "resetFilterKeyword"): void;
}

const { browserTarget } = useBrowserTarget();

const grid = useTemplateRef<HTMLElement>("grid");
const { displayedViewMode, enter, flip } = useCatalogGridMotion(grid, toRef(props, "savedViewMode"));

const products = toRef(props, "products");

/** What the grid is showing, which lags `products` for as long as a flip takes to change it over. */
const displayedProducts = ref<Product[]>([...products.value]);

/** A sorting was chosen and the result it asked for has not arrived yet. */
const awaitingSort = ref(false);

/**
 * Sorting does not change the question, only the answer's order, so the page keeps the cards it has
 * while the new order is fetched. Every other reload — a filter, a category, a search — is a
 * different question, and showing the old answer under it would be a lie.
 */
const holdingCards = computed(() => awaitingSort.value && displayedProducts.value.length > 0);

watch(
  () => props.sortToken,
  () => {
    awaitingSort.value = true;
  },
);

/**
 * The change-over is driven by the result itself, not by the loading flag. Sorting is done by the
 * backend, and a sorting the reader has already visited comes straight back out of the cache — the
 * flag never rises, so anything waiting on it would animate on a first visit and sit still on a
 * second, which is exactly how it behaved.
 */
watch(products, async (next) => {
  if (!awaitingSort.value) {
    displayedProducts.value = [...next];
    return;
  }

  awaitingSort.value = false;

  // The backend decides what comes back, so the new page need not be the length of the old one. The
  // seats both pages share turn over; any beyond them are added or dropped once the wave is done.
  const flipped = await flip((index) => {
    if (index < next.length) {
      displayedProducts.value[index] = next[index];
    }
  });

  displayedProducts.value = [...next];

  if (!flipped) {
    await enter();
  }
});

// Every other reload — a filter, a category, a search — asks a different question, so it holds
// skeletons and its answer rises in. A search that is still running has nothing to show yet.
watch(
  () => props.fetchingProducts,
  async (isFetching, wasFetching) => {
    if (isFetching || !wasFetching || awaitingSort.value) {
      return;
    }

    await enter();
  },
);

onMounted(() => {
  if (!props.fetchingProducts) {
    void enter();
  }
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

const breakpoints = useBreakpoints(BREAKPOINTS);

const skeletonComponent = computed(() =>
  displayedViewMode.value === "list" ? ProductSkeletonList : ProductSkeletonGrid,
);

const columns = computed(() => ({
  null: 1,
  xs: 2,
  md: Number(props.columnsAmountTablet),
  xl: Number(props.columnsAmountDesktop),
}));

const lazyCardsCount = computed(() => {
  if (displayedViewMode.value === "grid") {
    return getGridLazyCardsCount();
  }
  if (displayedViewMode.value === "list") {
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
    // Everything a card needs for the length of a turn, and not a moment longer. `will-change` puts
    // each card on its own layer so the turn is composited instead of repainting a card-sized
    // subtree every frame; holding sixteen such layers permanently would be the opposite trade.
    &--flipping > * {
      backface-visibility: hidden;
      transform-origin: 50% 50%;
      will-change: transform;
    }

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

  &__pagination {
    @apply flex justify-center;

    &--previous {
      @apply -mt-2 mb-6;
    }

    &--next {
      @apply mt-6;
    }
  }

  &__load-button {
    @apply mt-4;
  }

  &__infinity {
    @apply mt-8;
  }
}
</style>
