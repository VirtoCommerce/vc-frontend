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
export const OUTLINE_FILTER_NAME = "__outline";
export const AVAILABILITY_FILTER_NAME = "availability";
export const VENDOR_FULFILMENT_FILTER_NAME = "available_in";
export const IS_PURCHASED_FILTER_NAME = "isPurchased";
