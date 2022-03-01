import { computed } from "vue";
import { defaultPageSize, pageSizes } from "@core/constants";
import {
  fromRouteQuery,
  ProductsSearchParams,
  toRouteQuery,
  UrlParamKeys,
  UseProductsSearchParamsOptions,
} from "@/shared/catalog";
import { NavigationFailure, RouteLocationRaw, useRouter } from "vue-router";
import QueryParamName from "@core/query-param-name.enum";

export default (options: UseProductsSearchParamsOptions = {}) => {
  const {
    sortList,
    defaultSortBy = "",
    itemsPerPageList = pageSizes,
    defaultItemsPerPage = defaultPageSize,
    urlParamKeys: customUrlParamKeys,
  } = options;

  const urlParamKeys: Required<UrlParamKeys> = {
    keywordKey: QueryParamName.SearchPhrase,
    filterKey: QueryParamName.Filter,
    sortKey: QueryParamName.Sort,
    pageKey: QueryParamName.Page,
    itemsPerPageKey: QueryParamName.ItemsPerPage,
    ...customUrlParamKeys,
  };

  const router = useRouter();

  const searchParams = computed<ProductsSearchParams>(() =>
    fromRouteQuery(router.currentRoute.value.query, {
      sortList,
      defaultSortBy,
      itemsPerPageList,
      defaultItemsPerPage,
      urlParamKeys,
    })
  );

  async function updateSearchParams(
    newParams: Partial<ProductsSearchParams>,
    method: "push" | "replace" = "push"
  ): Promise<void | NavigationFailure> {
    const { hash, params, query } = router.currentRoute.value;
    const newLocation: RouteLocationRaw = {
      hash,
      params,
      query: {
        ...query,
        ...toRouteQuery({ ...searchParams.value, ...newParams }, { urlParamKeys }),
      },
    };

    if (router.currentRoute.value.fullPath !== router.resolve(newLocation).fullPath) {
      return await router[method](newLocation);
    }
  }

  return {
    searchParams,
    updateSearchParams,
  };
};
