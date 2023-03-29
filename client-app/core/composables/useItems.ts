import _ from "lodash";
import { reactive, readonly, ref, shallowRef, toRefs } from "vue";
import {
  DEFAULT_FILTERS,
  DEFAULT_ITEMS,
  DEFAULT_KEYWORD,
  DEFAULT_PAGE,
  DEFAULT_PAGES,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
} from "@/core/constants/search";
import { QueryParamName } from "@/core/enums/query-param-name.enum";
import { Filters, Sort } from "@/core/types/search";
import { SearchPhraseParser } from "@/core/utilities/search";
import { useAsync } from "./useAsync";
import { useRouteQueryParam } from "./useRouteQueryParam";
import type { AsyncActionType } from "./useAsync";
import type { IHasLoading } from "./useLoading";
import type { IConnection, IPageSize, ISearchOptions, ISearchParams, ISearchQueryArguments } from "@/core/types/search";
import type { DeepReadonly, Ref } from "vue";
import type { LocationQueryValue } from "vue-router";

export interface IUseItems<Item> extends IHasLoading {
  total: Readonly<Ref<number>>;
  pages: Readonly<Ref<number>>;
  page: Readonly<Ref<number>>;
  keyword: Readonly<Ref<string>>;
  sort: Readonly<Ref<Sort>>;
  filters?: Readonly<Ref<DeepReadonly<Filters> | undefined>>;
  items: Ref<Item[]>;
  load: AsyncActionType<Partial<ISearchParams>>;
  changePage: (page: number, params?: Partial<Omit<ISearchParams, "page">>) => Promise<void>;
  applySort: (param: string | Sort, params?: Partial<Omit<ISearchParams, "sort">>) => Promise<void>;
  applyFilters: (
    param: string | Filters | undefined,
    params?: Partial<Omit<ISearchParams, "filters">>
  ) => Promise<void>;
}

/**
 * Wrap multiple items loading. Pagination, search by keyword, sorting & filtering available.
 * @param innerLoad Inner load action, usually API call
 * @param overridingOptions Available sort & filter options which will be used instead of default
 * @param overridingDefaults Page size, page number, keyword, sort & filters which will be used instead of default
 * @param requiredFilters Filters always applyed at the top of user selected
 * @example
 * export const DEFAULT_SORT = new Sort(nameof<Order>("modifiedDate"), SortDirection.Descending);

 * export const DEFAULT_FILTERS: Filters = [new TermFilter(nameof<Order>("status"), [OrderStatus.Completed])];

 * export const REQUIRED_FILTERS: Filters = [
 *   new RangeFilter<Date>(
 *     nameof<Order>("createdDate"),
 *     new RangeFilterValue<Date>({ include: false, value: new Date(2000, 1, 1) }, { include: true, value: new Date() })
 *   )
 * ];

 * export type UseOrders = UseItems<Order>;

 * export function useOrders(
 *   searchOrdersParams: MaybeRef<SearchOrdersParams>,
 *   overridingOptions?: Partial<SearchOptions>,
 *   overridingDefaults?: Partial<SearchParams & PageSize>,
 *   requiredFilters: Filters = REQUIRED_ORDERS_FILTERS
 * ): UseOrders {
 *   const defaults: Partial<SearchParams & PageSize> = {
 *     sort: DEFAULT_ORDERS_SORT,
 *     filters: DEFAULT_ORDERS_FILTERS,
 *     ...overridingDefaults,
 *   };

 *   const options: Partial<SearchOptions> = {
 *     sort: [DEFAULT_ORDERS_SORT],
 *     filters: DEFAULT_ORDERS_FILTERS,
 *     ...overridingOptions,
 *   };

 *   const composable = useItems<Order>(
 *     async (searchQueryArguments): Promise<OrderConnection> => {
 *       const response = await searchOrders({
 *         ...searchQueryArguments,
 *         organizationId: unref(searchOrdersParams).organizationId,
 *       });
 *       return response;
 *     },
 *     options,
 *     defaults,
 *     requiredFilters
 *   );

 *   return {
 *     ...composable,
 *   };
 */
export function useItems<Item>(
  innerLoad: AsyncActionType<ISearchQueryArguments, IConnection<Item>>,
  overridingOptions?: Partial<ISearchOptions>,
  overridingDefaults?: Partial<ISearchParams & IPageSize>,
  requiredFilters: Filters = new Filters()
): IUseItems<Item> {
  const defaults: ISearchParams & IPageSize = {
    pageSize: DEFAULT_PAGE_SIZE,
    page: DEFAULT_PAGE,
    keyword: DEFAULT_KEYWORD,
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
    ...overridingDefaults,
  };

  const options: ISearchOptions = {
    sort: [DEFAULT_SORT],
    filters: DEFAULT_FILTERS,
    ...overridingOptions,
  };

  const sortQueryParam = useRouteQueryParam<NonNullable<LocationQueryValue>>(QueryParamName.Sort, {
    defaultValue: defaults.sort.toString(),
    validator: (sortValue: NonNullable<LocationQueryValue>) => {
      const sort = Sort.fromString(sortValue);
      return options.sort.some((sortOption) => _.isEqual(sortOption, sort)) ?? false;
    },
  });

  const filtersQueryParam = useRouteQueryParam<NonNullable<LocationQueryValue>>(QueryParamName.Facets, {
    defaultValue: defaults.filters?.toString(),
    validator: (filtersValue: NonNullable<LocationQueryValue>) => {
      const filters = SearchPhraseParser.INSTANCE.parse(filtersValue).filters;
      return (
        filters?.every((filter) => options.filters?.some((filterOption) => _.isEqual(filterOption, filter))) ?? false
      );
    },
  });

  const searchParams = reactive<ISearchParams>({
    page: defaults.page,
    keyword: defaults.keyword,
    sort: Sort.fromString(sortQueryParam.value),
    filters: SearchPhraseParser.INSTANCE.parse(filtersQueryParam.value).filters,
  });

  const total = ref(0);
  const pages = ref(DEFAULT_PAGES);
  const items = shallowRef<Item[]>(DEFAULT_ITEMS);

  const { loading, action: load } = useAsync<Partial<ISearchParams>>(async (overridingSearchParams) => {
    Object.assign(searchParams, {
      ...searchParams,
      ...overridingSearchParams,
    });

    sortQueryParam.value = searchParams?.sort?.toString();
    filtersQueryParam.value = searchParams?.filters?.toString() ?? "";

    const searchQueryArguments: ISearchQueryArguments = {
      first: defaults.pageSize,
      after: String((searchParams.page - 1) * defaults.pageSize),
      keyword: searchParams.keyword,
      sort: searchParams.sort.toString(),
      filter: new Filters(...requiredFilters, ...(searchParams.filters ?? [])).toString(),
    };

    const connection = await innerLoad(searchQueryArguments);

    total.value = connection.totalCount ?? 0;
    pages.value = Math.ceil(total.value / defaults.pageSize) || DEFAULT_PAGES;
    items.value = connection.items || [];
  });

  async function changePage(page: number, params?: Partial<Omit<ISearchParams, "page">>): Promise<void> {
    await load({ page, ...params });
  }

  async function applySort(param: string | Sort, params?: Partial<Omit<ISearchParams, "sort">>): Promise<void> {
    const sort = param instanceof Sort ? param : Sort.fromString(param);
    await changePage(1, { sort, ...params });
  }

  async function applyFilters(
    param: string | Filters | undefined,
    params?: Partial<Omit<ISearchParams, "filters">>
  ): Promise<void> {
    let filters: Filters | undefined;
    if (param === undefined) {
      filters = undefined;
    } else {
      filters = Array.isArray(param) ? param : SearchPhraseParser.INSTANCE.parse(param).filters;
    }
    await changePage(1, { filters, ...params });
  }

  const { page, keyword, sort, filters } = toRefs(readonly(searchParams));

  return {
    loading,
    load,
    total: readonly(total),
    pages: readonly(pages),
    page,
    keyword,
    sort,
    filters,
    items: items,
    changePage,
    applySort,
    applyFilters,
  };
}
