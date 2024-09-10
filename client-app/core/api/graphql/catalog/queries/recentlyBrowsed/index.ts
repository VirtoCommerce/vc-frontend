import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import searchRecommendedProductsQueryDocument from "./recentlyBrowsed.graphql";
import type { Query, QueryRecentlyBrowsedArgs, GetRecentlyBrowsedResponseType } from "@/core/api/graphql/types";

export type RecentlyBrowsedParamsType = {
  maxProducts?: number;
};

export async function recentlyBrowsed({
  maxProducts = 6,
}: RecentlyBrowsedParamsType = {}): Promise<GetRecentlyBrowsedResponseType> {
  const { storeId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "recentlyBrowsed">>, QueryRecentlyBrowsedArgs>({
    query: searchRecommendedProductsQueryDocument,
    variables: {
      storeId,
      cultureName,
      currencyCode,
      maxProducts,
    },
  });

  return data.recentlyBrowsed ?? [];
}
