import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useRouteQueryParam } from "@/core/composables/useRouteQueryParam";
import { QueryParamName } from "@/core/enums";
import type { Product, VariationType } from "@/core/api/graphql/types";
import type { AddToCartParamsAdditionalType } from "@/core/types/analytics";

export function useAnalyticsUtils() {
  const route = useRoute();
  const searchQueryParam = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
  const { analytics } = useAnalytics();

  const sourceRoute = computed<string>(() =>
    typeof route.name === "string" && route.name !== "Matcher" ? route.name : route.path,
  );

  function trackAddItemToCart(
    product: Product | VariationType,
    quantity: number,
    params?: AddToCartParamsAdditionalType,
  ) {
    analytics("addItemToCart", product, quantity, {
      source_route: sourceRoute.value,
      search_terms: searchQueryParam.value || undefined,
      ...params,
    });
  }

  function trackAddItemsToCart(products: Product[] | VariationType[], params?: AddToCartParamsAdditionalType) {
    analytics("addItemsToCart", products, {
      source_route: sourceRoute.value,
      search_terms: searchQueryParam.value || undefined,
      ...params,
    });
  }

  return {
    trackAddItemToCart,
    trackAddItemsToCart,
  };
}
