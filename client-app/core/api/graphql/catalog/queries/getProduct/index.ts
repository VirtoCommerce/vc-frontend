import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getProductsQueryDocument from "./getProductQuery.graphql";
import type { Product, Query, QueryProductArgs } from "@/core/api/graphql/types";

export async function getProduct(id: string): Promise<Product | undefined> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "product">>, QueryProductArgs>({
    query: getProductsQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      id,
    },
  });

  return data.product;
}
