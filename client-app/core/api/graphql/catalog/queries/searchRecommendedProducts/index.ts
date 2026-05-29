import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import searchRecommendedProductsQueryDocument from "./searchRecommendedProducts.graphql";
import type { Query, QueryRecommendationsArgs, GetRecommendationsResponseType } from "@/core/api/graphql/types";

export type RecommendedProductsSearchParamsType = {
  productId: string;
  model: string;
  maxRecommendations?: number;
  fallbackProductsFilter?: string;
  currencyCodeOverride?: string;
};

export async function searchRecommendedProducts({
  productId,
  model,
  maxRecommendations = 6,
  fallbackProductsFilter,
  currencyCodeOverride,
}: RecommendedProductsSearchParamsType): Promise<GetRecommendationsResponseType> {
  const { storeId, userId, cultureName, currencyCode: defaultCurrencyCode } = globals;
  const currencyCode = currencyCodeOverride || defaultCurrencyCode;

  const { data } = await graphqlClient.query<Required<Pick<Query, "recommendations">>, QueryRecommendationsArgs>({
    query: searchRecommendedProductsQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      productId,
      model,
      maxRecommendations,
      fallbackProductsFilter,
    },
  });

  return data.recommendations ?? [];
}
