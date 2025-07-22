import { Sort } from "@/core/types/search/sorting";
import type { SearchProductFilterRangeValue } from "../api/graphql/types";

export const DEFAULT_PAGE_SIZE = 16;

export const PAGE_LIMIT = 100;

export const DEFAULT_SORT = new Sort();

export const DEFAULT_SEARCH_HISTORY_MAX_COUNT = 5;

// todo check locale prop
// returns from the backend after we send there resul of the function getFilterExpressionForZeroPrice
export const zeroPriceFilter: SearchProductFilterRangeValue = {
  includeUpperBound: false,
  includeLowerBound: false,
  lower: "0",
};
