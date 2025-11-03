import { ref, watch } from "vue";
import {
  getFilterExpression,
  getFilterExpressionForAvailableIn,
  getFilterExpressionForInStock,
  getFilterExpressionForPurchasedBefore,
} from "@/core/utilities";
import type { ProductsFiltersType, ProductsSearchParamsType } from "../types";
import type { MaybeRef, Ref, WatchSource } from "vue";

export interface IUseProductVariationsOptions {
  /** @default 50 */
  itemsPerPage?: MaybeRef<number>;
  /** Products filters from useProducts composable */
  productsFilters: Ref<ProductsFiltersType>;
  /** Sort expression string */
  sort?: MaybeRef<string | undefined>;
  /** Filter expression for variations */
  variationsFilterExpression: MaybeRef<string>;
  /** Custom filter builder function - if provided, uses this instead of productsFilters */
  customFilterBuilder?: () => string;
  /** Dependencies to watch for customFilterBuilder - if provided, will trigger rebuild */
  customFilterBuilderDeps?: WatchSource[];
}

export interface IUseProductVariationsReturn {
  /** Search params for variations (writable computed) */
  variationsSearchParams: Ref<ProductsSearchParamsType>;
  /** Current page number */
  variationsPageNumber: Ref<number>;
  /** Reset variations params when product changes */
  resetVariationsParams: () => void;
  /** Update search params with new filters (for manual updates) */
  updateSearchParams: (updates: Partial<ProductsSearchParamsType>) => void;
}

/**
 * Composable for managing product variations search parameters
 * @param options - Configuration options
 * @returns Variations search state and methods
 */
export function useProductVariations(options: IUseProductVariationsOptions): IUseProductVariationsReturn {
  const {
    itemsPerPage = 50,
    productsFilters,
    sort,
    variationsFilterExpression,
    customFilterBuilder,
    customFilterBuilderDeps,
  } = options;

  const itemsPerPageRef = typeof itemsPerPage === "number" ? ref(itemsPerPage) : itemsPerPage;

  let sortRef: Ref<string | undefined>;
  if (sort === undefined) {
    sortRef = ref(undefined);
  } else if (typeof sort === "string") {
    sortRef = ref(sort);
  } else {
    sortRef = sort;
  }

  const variationsPageNumber = ref(1);

  const variationsFilterExpressionRef =
    typeof variationsFilterExpression === "string" ? ref(variationsFilterExpression) : variationsFilterExpression;

  function buildSearchParams(): ProductsSearchParamsType {
    const filterExpression = customFilterBuilder
      ? customFilterBuilder()
      : getFilterExpression([
          variationsFilterExpressionRef.value,
          getFilterExpressionForAvailableIn(productsFilters.value.branches),
          getFilterExpressionForInStock(productsFilters.value.inStock),
          getFilterExpressionForPurchasedBefore(productsFilters.value.purchasedBefore),
        ]);

    return {
      page: variationsPageNumber.value,
      itemsPerPage: itemsPerPageRef.value,
      sort: sortRef.value ?? undefined,
      filter: filterExpression,
    };
  }

  const variationsSearchParams = ref<ProductsSearchParamsType>(buildSearchParams());

  const watchDeps: WatchSource[] = [
    variationsPageNumber,
    variationsFilterExpressionRef,
    productsFilters,
    itemsPerPageRef,
    sortRef,
  ];

  if (customFilterBuilder && customFilterBuilderDeps) {
    watchDeps.push(...customFilterBuilderDeps);
  }

  watch(watchDeps, () => {
    variationsSearchParams.value = buildSearchParams();
  });

  function resetVariationsParams(): void {
    variationsPageNumber.value = 1;
  }

  function updateSearchParams(updates: Partial<ProductsSearchParamsType>): void {
    variationsSearchParams.value = {
      ...variationsSearchParams.value,
      ...updates,
    };
  }

  return {
    variationsSearchParams,
    variationsPageNumber,
    resetVariationsParams,
    updateSearchParams,
  };
}
