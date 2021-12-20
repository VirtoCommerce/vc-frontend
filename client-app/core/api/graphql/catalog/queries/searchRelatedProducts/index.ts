import client from "@core/api/graphql/graphql-client";
import { ProductAssociation } from "@core/api/graphql/types";
import { currencyCode, locale, storeId } from "@core/constants";
import searchRelatedProductsQueryDocument from "./searchRelatedProducts.graphql";

export default async function searchRelatedProducts(id: string): Promise<ProductAssociation[]> {
  const { data } = await client.query({
    query: searchRelatedProductsQueryDocument,
    variables: {
      storeId: storeId,
      currencyCode: currencyCode,
      id,
      cultureName: locale,
    },
  });
  return data?.product?.associations?.items;
}
