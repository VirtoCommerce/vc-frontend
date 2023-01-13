import {
  Filters,
  nameof,
  PageSize,
  RangeFilter,
  RangeFilterValue,
  SearchOptions,
  SearchParams,
  Sort,
  SortDirection,
  TermFilter,
  UseItems,
  useItems,
} from "@/core";
import { searchCustomerReviews } from "@/xapi";
import { CustomerReview, CustomerReviewConnection, CustomerReviewStatus } from "@/xapi/types";
import { MaybeRef } from "@vueuse/core";
import { unref } from "vue";
import { SearchCustomerReviewsParams } from "../types";

export const DEFAULT_CUSTOMER_REVIEWS_SORT = new Sort(nameof<CustomerReview>("modifiedDate"), SortDirection.Descending);

export const CUSTOMER_REVIEWS_ONLY_POSITIVE_FILTER = new RangeFilter<number>(
  nameof<CustomerReview>("rating"),
  new RangeFilterValue<number>({ include: true, value: 4 }, { include: true, value: 5 })
);

export const DEFAULT_CUSTOMER_REVIEWS_FILTERS: Filters = [CUSTOMER_REVIEWS_ONLY_POSITIVE_FILTER];

export const REQUIRED_CUSTOMER_REVIEWS_FILTERS: Filters = [
  new TermFilter(nameof<CustomerReview>("reviewStatus"), [CustomerReviewStatus.Approved]),
];

export type UseCustomerReviews = UseItems<CustomerReview>;

export function useCustomerReviews(
  searchCustomerReviewsParams: MaybeRef<SearchCustomerReviewsParams>,
  overridingOptions?: Partial<SearchOptions>,
  overridingDefaults?: Partial<SearchParams & PageSize>,
  requiredFilters: Filters = REQUIRED_CUSTOMER_REVIEWS_FILTERS
): UseCustomerReviews {
  const defaults: Partial<SearchParams & PageSize> = {
    sort: DEFAULT_CUSTOMER_REVIEWS_SORT,
    filters: DEFAULT_CUSTOMER_REVIEWS_FILTERS,
    ...overridingDefaults,
  };

  const options: Partial<SearchOptions> = {
    sort: [DEFAULT_CUSTOMER_REVIEWS_SORT],
    filters: DEFAULT_CUSTOMER_REVIEWS_FILTERS,
    ...overridingOptions,
  };

  const composable = useItems<SearchCustomerReviewsParams, CustomerReview>(
    searchCustomerReviewsParams,
    async (searchQueryArguments): Promise<CustomerReviewConnection> => {
      const response = await searchCustomerReviews({
        ...searchQueryArguments,
        entityId: unref(searchCustomerReviewsParams).entityId,
        entityType: unref(searchCustomerReviewsParams).entityType,
      });
      return response;
    },
    options,
    defaults,
    requiredFilters
  );

  return {
    ...composable,
  };
}
