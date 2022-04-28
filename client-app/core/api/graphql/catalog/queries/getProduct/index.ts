import client from "@core/api/graphql/graphql-client";
import { Product, Query, QueryProductArgs } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import getProductsQueryDocument from "./getProductQuery.graphql";

export default async function getProduct(id: string): Promise<Product | null> {
  const { data } = await client.query<Required<Pick<Query, "product">>, QueryProductArgs>({
    query: getProductsQueryDocument,
    variables: {
      id,
      storeId,
      currencyCode,
      cultureName: locale,
      userId: currentUserId,
    },
  });

  return data.product;
}
