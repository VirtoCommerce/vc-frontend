import client from "@core/api/graphql/graphql-client";
import { Product, Query, QueryProductArgs } from "@core/api/graphql/types";
import getProductsQueryDocument from "./getProductQuery.graphql";
import globals from "@core/globals";

export default async function getProduct(id: string): Promise<Product | null> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await client.query<Required<Pick<Query, "product">>, QueryProductArgs>({
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
