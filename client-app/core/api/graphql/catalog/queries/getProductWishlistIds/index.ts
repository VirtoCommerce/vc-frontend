import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getProductWishlistIdsDocument from "./getProductWishlistIdsQuery.graphql";
import type { Query, QueryProductArgs } from "@/core/api/graphql/types";

export async function getProductWishlistIds(id: string): Promise<string[] | undefined> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "product">>, QueryProductArgs>({
    query: getProductWishlistIdsDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      id,
    },
  });

  return data.product?.wishlistIds;
}
