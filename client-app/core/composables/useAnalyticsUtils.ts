import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { useHistoricalEvents } from "@/core/composables/useHistoricalEvents";
import { useRouteQueryParam } from "@/core/composables/useRouteQueryParam";
import { QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import { useShortCart } from "@/shared/cart/composables/useCart";
import type { Product, VariationType } from "@/core/api/graphql/types";
import type { AddToCartParamsAdditionalType } from "@/core/types/analytics";

export function useAnalyticsUtils() {
  const { pushHistoricalEvent } = useHistoricalEvents();
  const route = useRoute();
  const searchQueryParam = useRouteQueryParam<string>(QueryParamName.SearchPhrase);
  const { cart } = useShortCart();
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
      sourceRoute: sourceRoute.value,
      searchTerms: searchQueryParam.value || undefined,
      ...params,
    });
    pushAddToCartHistoricalEvent(product.id);
  }

  function trackAddItemsToCart(products: Product[] | VariationType[], params?: AddToCartParamsAdditionalType) {
    analytics("addItemsToCart", products, {
      sourceRoute: sourceRoute.value,
      searchTerms: searchQueryParam.value || undefined,
      ...params,
    });
    pushAddToCartHistoricalEvent(products.map((product) => product.id));
  }

  function pushAddToCartHistoricalEvent(payload: string | string[]) {
    void pushHistoricalEvent({
      eventType: "addToCart",
      sessionId: cart.value?.id,
      productId: typeof payload === "string" ? payload : undefined,
      productIds: Array.isArray(payload) ? payload : undefined,
      storeId: globals.storeId,
    });
  }

  return {
    trackAddItemToCart,
    trackAddItemsToCart,
  };
}
