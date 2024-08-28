import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import searchRecommendedProductsQueryDocument from "./searchRecommendedProducts.graphql";
import type { Query, QueryRecommendationsArgs, GetRecommendationsResponseType } from "@/core/api/graphql/types";

export type RecommendedProductsSearchParamsType = {
  productId: string;
  model: string;
  maxRecommendations?: string;
  fallbackProductsFilter?: string;
};

export async function searchRecommendedProducts({
  productId,
  model,
  maxRecommendations = "6",
  fallbackProductsFilter,
}: RecommendedProductsSearchParamsType): Promise<GetRecommendationsResponseType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

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
