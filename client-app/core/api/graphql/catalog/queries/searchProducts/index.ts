import client from "@core/api/graphql/graphql-client";
import { ProductConnection, Query, QueryProductsArgs } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId, catalogId, defaultPageSize } from "@core/constants";
import searchProductsQueryDocument from "./searchProductsQuery.graphql";
import { ProductsSearchParams } from "@/shared/catalog";

export default async function searchProducts(
  {
    itemsPerPage = defaultPageSize,
    page = 1,
    categoryId,
    filter,
    sort,
    keyword,
    fuzzy,
    fuzzyLevel,
    productIds,
  }: Partial<ProductsSearchParams>,
  options: {
    // @default false
    withFacets?: boolean;
  } = {}
): Promise<ProductConnection> {
  const { withFacets = false } = options;
  const filterString = [`category.subtree:${catalogId}${categoryId ? "/" + categoryId : ""}`, filter]
    .filter(Boolean)
    .join(" ");

  const { data } = await client.query<Required<Pick<Query, "products">>, QueryProductsArgs & { withFacets: boolean }>({
    query: searchProductsQueryDocument,
    variables: {
      storeId,
      sort,
      fuzzy,
      fuzzyLevel,
      withFacets,
      query: keyword,
      userId: currentUserId,
      currencyCode: currencyCode,
      filter: filterString,
      cultureName: locale,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
      productIds,
    },
  });
  return data.products;
}
