import client from "@core/api/graphql/graphql-client";
import { ProductConnection } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId, catalogId } from "@core/constants";
import searchProductsQueryDocument from "./searchProductsQuery.graphql";

export default async function searchProducts({
  itemsPerPage = 20,
  page = 1,
  categoryId = "",
  sort = "",
}): Promise<ProductConnection> {
  const { data } = await client.query({
    query: searchProductsQueryDocument,
    variables: {
      storeId: storeId,
      sort: sort,
      userId: currentUserId,
      currencyCode: currencyCode,
      //filter: categoryId ? `category.subtree:${catalogId}/${categoryId}` : "",
      filter: categoryId ? `category.subtree:fc596540864a41bf8ab78734ee7353a3/${categoryId}` : "",
      cultureName: locale,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
    },
  });
  return data.products;
}
