import { ProductAssociation, ProductAssociationsArgs, Query, QueryProductArgs } from "@/xapi/types";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import searchRelatedProductsQueryDocument from "./searchRelatedProducts.graphql";
import { RelatedProductsSearchParams } from "../../types";
import globals from "@/core/globals";

export default async function searchRelatedProducts({
  productId,
  group,
  query,
  page = 1,
  itemsPerPage = DEFAULT_PAGE_SIZE,
}: RelatedProductsSearchParams): Promise<ProductAssociation[]> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<
    Required<Pick<Query, "product">>,
    QueryProductArgs & ProductAssociationsArgs
  >({
    query: searchRelatedProductsQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      group,
      query,
      id: productId,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
    },
  });

  return data.product?.associations?.items ?? [];
}
