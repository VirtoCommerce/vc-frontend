import { Product, Query, QueryProductArgs } from "@/xapi/types";
import getProductsQueryDocument from "./getProductQuery.graphql";
import globals from "@/core/globals";

export default async function getProduct(id: string): Promise<Product | null> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "product">>, QueryProductArgs>({
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
