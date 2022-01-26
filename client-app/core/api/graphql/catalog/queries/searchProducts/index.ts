import client from "@core/api/graphql/graphql-client";
import { ProductConnection, Query, QueryProductsArgs } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId, catalogId } from "@core/constants";
import searchProductsQueryDocument from "./searchProductsQuery.graphql";
import { ProductsSearchParams } from "@/shared/catalog";

export default async function searchProducts({
  itemsPerPage = 20,
  page = 1,
  categoryId,
  filter,
  sort,
  query,
  fuzzy,
  fuzzyLevel,
}: ProductsSearchParams): Promise<ProductConnection> {
  const filterString = [categoryId ? `category.subtree:${catalogId}/${categoryId}` : "", filter]
    .filter(Boolean)
    .join(" ");

  const { data } = await client.query<Required<Pick<Query, "products">>, QueryProductsArgs>({
    query: searchProductsQueryDocument,
    variables: {
      storeId,
      sort,
      query,
      fuzzy,
      fuzzyLevel,
      userId: currentUserId,
      currencyCode: currencyCode,
      filter: filterString,
      cultureName: locale,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
    },
  });
  return data.products;
}
