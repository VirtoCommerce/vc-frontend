import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { SearchRelatedProductsDocument } from "./searchRelatedProducts.generated";
import type { ProductAssociation, ProductAssociationsArgs, Query, QueryProductArgs } from "@/core/api/graphql/types";

export type RelatedProductsSearchParamsType = {
  productId: string;
  page?: number;
  itemsPerPage?: number;
  group?: string;
  query?: string;
};

export async function searchRelatedProducts({
  productId,
  group,
  query,
  page = 1,
  itemsPerPage = DEFAULT_PAGE_SIZE,
}: RelatedProductsSearchParamsType): Promise<ProductAssociation[]> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "product">>,
    QueryProductArgs & ProductAssociationsArgs
  >({
    query: SearchRelatedProductsDocument,
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
