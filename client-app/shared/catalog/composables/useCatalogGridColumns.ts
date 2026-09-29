import { unrefElement, useResizeObserver, useWindowSize } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { BREAKPOINTS } from "@/ui-kit/constants";
import type { MaybeComputedElementRef } from "@vueuse/core";

/**
 * From lg the grid holds as many 215px cards as fit with 20 between them: N columns need
 * N * 215 + (N - 1) * 20 of listing. The same steps are written as container queries in
 * `category-products.vue`; the two have to move together.
 */
const LISTING_STEPS = [
  { minWidth: 1390, columns: 6 },
  { minWidth: 1155, columns: 5 },
  { minWidth: 920, columns: 4 },
  { minWidth: 685, columns: 3 },
] as const;

const SM = Number.parseInt(BREAKPOINTS.sm);
const LG = Number.parseInt(BREAKPOINTS.lg);

/** How many columns the catalog grid draws for this window and this listing width. */
export function getGridColumns(viewportWidth: number, listingWidth: number): number {
  if (viewportWidth < SM) {
    return 1;
  }

  if (viewportWidth < LG) {
    return 2;
  }

  return LISTING_STEPS.find((step) => listingWidth >= step.minWidth)?.columns ?? 2;
}

/**
 * The page size rounded up to whole rows, so a page never ends on a part-filled row:
 * 16 on 1, 2 and 4 columns; 18 on 3 and 6; 20 on 5.
 */
export function getRowAlignedPageSize(columns: number, pageSize: number): number {
  return Math.ceil(pageSize / columns) * columns;
}

/**
 * The grid's live column count, read off the listing element the grid is laid out in. The width is
 * taken as soon as the listing mounts, not left to the first resize callback: the first products
 * request goes out a moment later and has to ask for whole rows already.
 */
export function useCatalogGridColumns(listing: MaybeComputedElementRef) {
  const { width: viewportWidth } = useWindowSize();
  const listingWidth = ref(0);

  function measure() {
    listingWidth.value = unrefElement(listing)?.getBoundingClientRect().width ?? 0;
  }

  onMounted(measure);
  useResizeObserver(listing, measure);

  return computed(() => getGridColumns(viewportWidth.value, listingWidth.value));
}
