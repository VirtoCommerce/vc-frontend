import client from "@core/api/graphql/graphql-client";
import { ProductAssociation, Query, QueryProductArgs } from "@core/api/graphql/types";
import { currencyCode, currentUserId, defaultPageSize, locale, storeId } from "@core/constants";
import searchRelatedProductsQueryDocument from "./searchRelatedProducts.graphql";
import { RelatedProductsSearchParams } from "../../types";

export default async function searchRelatedProducts({
  productId,
  group,
  query,
  page = 1,
  itemsPerPage = defaultPageSize,
}: RelatedProductsSearchParams): Promise<ProductAssociation[]> {
  const { data } = await client.query<
    Pick<Query, "product">,
    QueryProductArgs & {
      after?: string;
      first?: number;
      group?: string;
      query?: string;
    }
  >({
    query: searchRelatedProductsQueryDocument,
    variables: {
      group,
      query,
      storeId,
      currencyCode,
      cultureName: locale,
      userId: currentUserId,
      id: productId,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
    },
  });

  return data.product?.associations?.items ?? [];
}
