import client from "@core/api/graphql/graphql-client";
import { Product } from "@core/api/graphql/types";
import { currencyCode, locale, storeId } from "@core/constants";
import getProductsQueryDocument from "./getProductQuery.graphql";

export default async function getProduct(id: string): Promise<Product> {
  const { data } = await client.query({
    query: getProductsQueryDocument,
    variables: {
      storeId: storeId,
      currencyCode: currencyCode,
      id,
      cultureName: locale,
    },
  });
  return data.product;
}
