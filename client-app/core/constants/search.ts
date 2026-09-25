import { Sort } from "@/core/types/search/sorting";
import type { SearchProductFilterRangeValue } from "../api/graphql/types";

export const DEFAULT_PAGE_SIZE = 16;

export const PAGE_LIMIT = 100;

export const DEFAULT_SORT = new Sort();

export const DEFAULT_SEARCH_HISTORY_MAX_COUNT = 5;

// returns from the backend after we send there resul of the function getFilterExpressionForZeroPrice.
// Should be excluded from UI. Example: category page or product with variations page.
export const zeroPriceFilter: SearchProductFilterRangeValue = {
  includeUpperBound: false,
  includeLowerBound: false,
  lower: "0",
};

// Internal filter name that should be excluded from UI. Example: category page or product with variations page.
export const EXCLUDED_FILTER_NAMES = [
  "__outline",
  "availability",
  "inStock",
  "inStock_variations",
  "available_in",
  "isPurchased",
  "productfamilyid",
  "is",
  // A backend without the barcode expansion middleware echoes the term back as an ordinary user filter,
  // which `useProducts.prepareFilters` cannot drop by its `isGenerated` flag (the primary mechanism).
  // Keep it hidden by name until that backend version is the minimum supported one.
  "barcode",
];
