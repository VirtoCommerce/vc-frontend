import { computed } from "vue";
import { defaultPageSize, pageSizes } from "@core/constants";
import { fromRouteQuery, ProductsSearchParams, toRouteQuery, UseProductsSearchParamsOptions } from "@/shared/catalog";
import { NavigationFailure, RouteLocationRaw, useRouter } from "vue-router";

export default (options: UseProductsSearchParamsOptions = {}) => {
  const {
    sortList,
    defaultSortBy = "",
    itemsPerPageList = pageSizes,
    defaultItemsPerPage = defaultPageSize,
    routeUpdateMethod = "push",
  } = options;

  const router = useRouter();

  const searchParams = computed<ProductsSearchParams>(() =>
    fromRouteQuery(router.currentRoute.value.query, {
      sortList,
      defaultSortBy,
      itemsPerPageList,
      defaultItemsPerPage,
    })
  );

  async function updateSearchParams(newParams: Partial<ProductsSearchParams>): Promise<void | NavigationFailure> {
    const { hash, params, query } = router.currentRoute.value;
    const newLocation: RouteLocationRaw = {
      hash,
      params,
      query: {
        ...query,
        ...toRouteQuery({ ...searchParams.value, ...newParams }),
      },
    };

    if (router.currentRoute.value.fullPath !== router.resolve(newLocation).fullPath) {
      return await router[routeUpdateMethod](newLocation);
    }
  }

  return {
    searchParams,
    updateSearchParams,
  };
};
