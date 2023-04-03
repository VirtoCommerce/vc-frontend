import { unref } from "vue";
import { useAsync, useItems, useLoading } from "@/core/composables";
import { SortDirection } from "@/core/enums";
import { RangeFilter, RangeFilterValue, Sort, TermFilter, Filters } from "@/core/types";
import { nameof } from "@/core/utilities";
import { createCustomerReview, searchCustomerReviews } from "@/xapi";
import { CustomerReviewStatus } from "@/xapi/types";
import type { ICustomerReviewOptions, ICustomerReview } from "../types";
import type { IUseItems, AsyncActionType } from "@/core/composables";
import type { IPageSize, ISearchOptions, ISearchParams } from "@/core/types";
import type { CustomerReview, CustomerReviewConnection } from "@/xapi/types";
import type { MaybeRef } from "@vueuse/core";

export const DEFAULT_CUSTOMER_REVIEWS_SORT = new Sort(nameof<CustomerReview>("modifiedDate"), SortDirection.Descending);

export const CUSTOMER_REVIEWS_ONLY_POSITIVE_FILTER = new RangeFilter<number>(
  nameof<CustomerReview>("rating"),
  new RangeFilterValue<number>({ include: true, value: 4 }, { include: true, value: 5 })
);

export const DEFAULT_CUSTOMER_REVIEWS_FILTERS: Filters = new Filters(CUSTOMER_REVIEWS_ONLY_POSITIVE_FILTER);

export const REQUIRED_CUSTOMER_REVIEWS_FILTERS: Filters = new Filters(
  new TermFilter(nameof<CustomerReview>("reviewStatus"), [CustomerReviewStatus.Approved])
);

export interface IUseCustomerReviewsType extends IUseItems<CustomerReview> {
  create: AsyncActionType<ICustomerReview>;
}

export function useCustomerReviews(
  customerReviewsOptions: MaybeRef<ICustomerReviewOptions>,
  overridingOptions?: Partial<ISearchOptions>,
  overridingDefaults?: Partial<ISearchParams & IPageSize>,
  requiredFilters: Filters = REQUIRED_CUSTOMER_REVIEWS_FILTERS
): IUseCustomerReviewsType {
  const defaults: Partial<ISearchParams & IPageSize> = {
    sort: DEFAULT_CUSTOMER_REVIEWS_SORT,
    filters: DEFAULT_CUSTOMER_REVIEWS_FILTERS,
    ...overridingDefaults,
  };

  const options: Partial<ISearchOptions> = {
    sort: [DEFAULT_CUSTOMER_REVIEWS_SORT],
    filters: DEFAULT_CUSTOMER_REVIEWS_FILTERS,
    ...overridingOptions,
  };

  const useItemsComposable = useItems<CustomerReview>(
    async (searchQueryArguments): Promise<CustomerReviewConnection> => {
      return await searchCustomerReviews({
        ...searchQueryArguments,
        ...unref(customerReviewsOptions),
      });
    },
    options,
    defaults,
    requiredFilters
  );

  const { loading: createLoading, action: create } = useAsync<ICustomerReview>(async (args) => {
    await createCustomerReview({
      ...unref(customerReviewsOptions),
      ...args!,
    });
  });

  const loading = useLoading(useItemsComposable.loading, createLoading);

  return {
    ...useItemsComposable,
    create,
    loading,
  };
}
