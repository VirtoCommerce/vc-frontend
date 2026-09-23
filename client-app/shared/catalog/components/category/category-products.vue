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

      <!-- The list's column heading stands outside the rows, as the design sets it, and takes its
           columns from the same variable the rows do. -->
      <div v-if="displayedViewMode === 'list'" class="category-products__list-head" aria-hidden="true">
        <span />

        <span>{{ $t("shared.catalog.product_list.product") }}</span>

        <span>{{ $t("shared.catalog.product_list.availability") }}</span>

        <span class="text-end">{{ $t("shared.catalog.product_list.unit_price") }}</span>

        <span class="col-span-2 text-end">{{ $t("shared.catalog.product_list.add_to_cart") }}</span>
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

      <!-- A phone's way back up, as the design has it: an orange disc once the reader is 400 down. -->
      <VcButton
        v-if="isCompact && scrolledDown"
        class="category-products__scroll-top"
        icon="chevron-up"
        :aria-label="$t('common.buttons.scroll_to_top')"
        @click="scrollToTop"
      />
    </template>

    <!-- Where the grid would be: what happened, and the way out beside it. -->
    <div v-else class="category-products__empty">
      <p class="category-products__empty-title">
        {{
          hasActiveFilters || keyword
            ? $t("pages.catalog.no_products_filtered_message")
            : $t("pages.catalog.no_products_message")
        }}
      </p>

      <template v-if="hasActiveFilters || keyword">
        <p class="category-products__empty-hint">{{ $t("pages.catalog.no_products_filtered_hint") }}</p>

        <VcButton size="sm" variant="outline" color="primary" @click="$emit('resetFilterKeyword')">
          {{ $t("common.buttons.reset_filters") }}
        </VcButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBreakpoints, useWindowScroll } from "@vueuse/core";
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
});

interface IProps {
  cardType?: "full" | "short";
  fetchingMoreProducts: boolean;
  fetchingProducts: boolean;
  fixedProductsCount?: number;
  hasActiveFilters: boolean;
  keyword?: string;
  itemsPerPage?: number;
  /** The grid's column count as it is drawn; the first two rows' images load eagerly. */
  gridColumns?: number;
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

/** A sorting was pressed and the result it asked for has not arrived yet. */
const awaitingSort = ref(false);

/** The result arrived and the cards are turning over to it. */
const changingOver = ref(false);

/**
 * Sorting does not change the question, only the answer's order, so the page keeps the cards it has
 * — through the wait AND through the turn that follows. Dropping them at either point puts
 * skeletons on screen mid-animation. Every other reload asks a different question, and showing the
 * old answer under it would be a lie.
 */
const holdingCards = computed(() => (awaitingSort.value || changingOver.value) && displayedProducts.value.length > 0);

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
 * second.
 */
watch(products, async (next) => {
  if (!awaitingSort.value) {
    displayedProducts.value = [...next];
    return;
  }

  // The store empties the list while it fetches. That is the question being asked, not the answer
  // to it — turning the cards over to it would turn them over to nothing.
  if (!next.length) {
    return;
  }

  awaitingSort.value = false;
  changingOver.value = true;

  // The cards turn onto their new products, and a product whose photo has not arrived turns onto a
  // blank. The result is in hand a moment before the wave starts, so the photos are fetched and
  // decoded in that moment — capped, because a slow image must not hold the whole grid still.
  await warmImages(next);

  // The backend decides what comes back, so the new page need not be the length of the old one. The
  // seats both pages share turn over; any beyond them are added or dropped once the wave is done.
  const flipped = await flip((index) => {
    if (index < next.length) {
      displayedProducts.value[index] = next[index];
    }
  });

  displayedProducts.value = [...next];
  changingOver.value = false;

  if (!flipped) {
    await enter();
  }
});

// Every other reload — a filter, a category, a search — asks a different question, so it holds
// skeletons and its answer rises in.
watch(
  () => props.fetchingProducts,
  async (isFetching, wasFetching) => {
    if (isFetching || !wasFetching) {
      return;
    }

    // The turn owns the change-over, and a search that came back with the page it already had has
    // nothing to turn to — release the hold rather than leave the grid waiting on a wave.
    if (changingOver.value) {
      return;
    }

    if (awaitingSort.value) {
      awaitingSort.value = false;
      return;
    }

    await enter();
  },
);

/**
 * Only the first cards need their photo before the wave reaches them — the last card does not turn
 * for another nine hundred milliseconds, which is head start enough. Waiting longer than this buys
 * nothing and delays the whole grid.
 */
const IMAGE_WARM_TIMEOUT = 150;

function warmImages(items: Product[]) {
  const sources = items.map((item) => item.imgSrc).filter((source): source is string => !!source);

  if (!sources.length) {
    return Promise.resolve();
  }

  const decoded = Promise.all(
    sources.map((source) => {
      const image = new Image();
      image.src = source;

      return image.decode().catch(() => undefined);
    }),
  );

  return Promise.race([decoded.then(() => undefined), new Promise<void>((r) => setTimeout(r, IMAGE_WARM_TIMEOUT))]);
}

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
const isCompact = breakpoints.smaller("lg");

const { y: scrollY } = useWindowScroll();
const scrolledDown = computed(() => scrollY.value > 400);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const skeletonComponent = computed(() =>
  displayedViewMode.value === "list" ? ProductSkeletonList : ProductSkeletonGrid,
);

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

  return (props.gridColumns ?? 1) * rowCount;
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
  @apply @container;

  --vc-product-title-font-size: theme("fontSize.sm");
  // photo · product · availability · unit price · add to cart · actions — read by the rows and the heading.
  // The design's 72 · 1fr · 132 · 124 · 196; its last track holds the stepper and the actions, and our
  // stepper does not go below 150, so that track is 150 plus the actions.
  --product-list-columns: 4.5rem minmax(0, 1fr) 8.25rem 7.75rem 9.375rem auto;

  &__list-head {
    @apply hidden gap-x-3 px-[1.0625rem] pb-2 text-[0.65625rem] font-bold uppercase tracking-[0.1em] text-neutral-500;

    grid-template-columns: var(--product-list-columns);

    // Shown on the same threshold the rows switch on, measured on the same box — the listing's own
    // width, which the window does not know once a sidebar stands beside it.
    @container (min-width: 60rem) {
      @apply grid;
    }
  }

  &__empty {
    @apply flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-neutral-200 px-6 py-14 text-center;

    background: rgb(from theme("colors.additional.50") r g b / 0.6);

    html.dark & {
      background: rgb(from theme("colors.primary.950") r g b / 0.06);
    }
  }

  &__empty-title {
    @apply m-0 font-geologica text-[1.0625rem] font-bold text-neutral-950;
  }

  &__empty-hint {
    @apply m-0 mb-3.5 text-[0.84375rem] text-neutral-500;
  }

  &__list {
    // Everything a card needs for the length of a turn, and not a moment longer. `will-change` puts
    // each card on its own layer so the turn is composited instead of repainting a card-sized
    // subtree every frame; holding sixteen such layers permanently would be the opposite trade.
    &--flipping > * {
      backface-visibility: hidden;
      transform-origin: 50% 50%;
      will-change: transform;
    }

    // The column count is the listing's own business, not the page's: a fixed count gave a 145px
    // card at 1240 once the rail took its share. One column on a phone, two on a tablet, and from
    // lg as many 215px cards as the listing holds with 20 between them.
    &--grid {
      @apply grid grid-cols-1 gap-5;

      @media (min-width: theme("screens.sm")) {
        @apply grid-cols-2;
      }

      @media (min-width: theme("screens.lg")) {
        @container (min-width: 685px) {
          @apply grid-cols-3;
        }

        @container (min-width: 920px) {
          @apply grid-cols-4;
        }

        @container (min-width: 1155px) {
          @apply grid-cols-5;
        }

        @container (min-width: 1390px) {
          @apply grid-cols-6;
        }
      }
    }

    &--list {
      @apply flex flex-col gap-2.5;
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

  &__scroll-top {
    @apply fixed bottom-4 end-4 z-[45] size-11 rounded-full;

    box-shadow: 0 4px 10px rgb(0 0 0 / 0.25);
  }

  // The end of the list is said quietly, a step down from the page's ink.
  &__infinity {
    @apply mt-9 text-neutral-700;
  }
}
</style>
