import {
  Connection,
  DEFAULT_FILTERS,
  DEFAULT_ITEMS,
  DEFAULT_KEYWORD,
  DEFAULT_PAGE,
  DEFAULT_PAGES,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  Filters,
  Load,
  PageSize,
  QueryParamName,
  SearchOptions,
  SearchParams,
  SearchPhraseParser,
  SearchQueryArguments,
  Sort,
  useRouteQueryParam,
} from "@/core";
import { MaybeRef } from "@vueuse/core";
import _ from "lodash";
import { DeepReadonly, reactive, readonly, Ref, ref, shallowRef, toRefs } from "vue";
import { LocationQueryValue } from "vue-router";
import { UseLoading, useLoading } from "./useLoading";

export interface UseItems<Item> extends UseLoading<Partial<SearchParams>> {
  total: Readonly<Ref<number>>;
  pages: Readonly<Ref<number>>;
  page: Readonly<Ref<number>>;
  keyword: Readonly<Ref<string>>;
  sort: Readonly<Ref<Sort>>;
  filters?: Ref<DeepReadonly<Filters> | undefined>;
  items: Ref<DeepReadonly<Item[]>>;
  changePage: (page: number, params: Partial<Omit<SearchParams, "page">>) => Promise<void>;
  applySort: (param: string | Sort) => Promise<void>;
  applyFilters: (param: string | Filters | undefined) => Promise<void>;
}

export function useItems<CustomSearchParams, Item>(
  customSearchParams: MaybeRef<CustomSearchParams>,
  innerLoad: Load<SearchQueryArguments, Connection<Item>>,
  overridingOptions?: Partial<SearchOptions>,
  overridingDefaults?: Partial<SearchParams & PageSize>,
  requiredFilters: Filters = []
): UseItems<Item> {
  const defaults: SearchParams & PageSize = {
    pageSize: DEFAULT_PAGE_SIZE,
    page: DEFAULT_PAGE,
    keyword: DEFAULT_KEYWORD,
    sort: DEFAULT_SORT,
    filters: DEFAULT_FILTERS,
    ...overridingDefaults,
  };

  const options: SearchOptions = {
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
    defaultValue: Filters.toString(defaults.filters),
    validator: (filtersValue: NonNullable<LocationQueryValue>) => {
      const filters = SearchPhraseParser.INSTANCE.parse(filtersValue).filters;
      return (
        filters?.every((filter) => options.filters?.some((filterOption) => _.isEqual(filterOption, filter))) ?? false
      );
    },
  });

  const searchParams = reactive<SearchParams>({
    page: defaults.page,
    keyword: defaults.keyword,
    sort: Sort.fromString(sortQueryParam.value),
    filters: SearchPhraseParser.INSTANCE.parse(filtersQueryParam.value).filters,
  });

  const total = ref(0);
  const pages = ref(DEFAULT_PAGES);
  const items = shallowRef<Item[]>(DEFAULT_ITEMS);

  const { loading, load } = useLoading<CustomSearchParams, Partial<SearchParams>>(
    customSearchParams,
    async (overridingSearchParams) => {
      Object.assign(searchParams, {
        ...searchParams,
        ...overridingSearchParams,
      });

      sortQueryParam.value = searchParams?.sort?.toString();
      filtersQueryParam.value = Filters.toString(searchParams?.filters) ?? "";

      const searchQueryArguments: SearchQueryArguments = {
        first: defaults.pageSize,
        after: String((searchParams.page - 1) * defaults.pageSize),
        keyword: searchParams.keyword,
        sort: searchParams.sort.toString(),
        filter: Filters.toString([...requiredFilters, ...(searchParams.filters ?? [])]),
      };

      const connection = await innerLoad(searchQueryArguments);

      total.value = connection.totalCount ?? 0;
      pages.value = Math.ceil(total.value / defaults.pageSize) || DEFAULT_PAGES;
      items.value = connection.items || [];
    }
  );

  async function changePage(page: number, params: Partial<Omit<SearchParams, "page">>): Promise<void> {
    await load({ page, ...params });
  }

  async function applySort(param: string | Sort): Promise<void> {
    const sort = param instanceof Sort ? param : Sort.fromString(param);
    await changePage(1, { sort });
  }

  async function applyFilters(param: string | Filters | undefined): Promise<void> {
    let filters: Filters | undefined;
    if (param === undefined) {
      filters = undefined;
    } else {
      filters = Array.isArray(param) ? param : SearchPhraseParser.INSTANCE.parse(param).filters;
    }
    await changePage(1, { filters });
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
    items: readonly(items),
    changePage,
    applySort,
    applyFilters,
  };
}
