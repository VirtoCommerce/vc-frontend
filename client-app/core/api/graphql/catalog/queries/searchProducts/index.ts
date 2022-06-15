import client from "@core/api/graphql/graphql-client";
import { ProductConnection, Query, QueryProductsArgs } from "@core/api/graphql/types";
import { DEFAULT_PAGE_SIZE } from "@core/constants";
import searchProductsQueryDocument from "./searchProductsQuery.graphql";
import { ProductsSearchParams } from "@/shared/catalog";
import globals from "@core/globals";

export default async function searchProducts(
  {
    itemsPerPage = DEFAULT_PAGE_SIZE,
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
  const { storeId, catalogId, userId, cultureName, currencyCode } = globals;
  const { withFacets = false } = options;
  const filterString = [`category.subtree:${catalogId}${categoryId ? "/" + categoryId : ""}`, filter]
    .filter(Boolean)
    .join(" ");

  const { data } = await client.query<Required<Pick<Query, "products">>, QueryProductsArgs & { withFacets: boolean }>({
    query: searchProductsQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      sort,
      fuzzy,
      fuzzyLevel,
      withFacets,
      query: keyword,
      filter: filterString,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
      productIds,
    },
  });

  return data.products;
}
