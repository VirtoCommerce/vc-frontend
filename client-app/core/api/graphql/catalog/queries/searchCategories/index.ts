import client from "@core/api/graphql/graphql-client";
import { CategoryConnection } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import searchCategoriesQueryDocument from "./searchCategoriesQuery.graphql";

export default async function searchCategories(itemsPerPage: number, page: number): Promise<CategoryConnection> {
  const { data } = await client.query({
    query: searchCategoriesQueryDocument,
    variables: {
      storeId: storeId,
      userId: currentUserId,
      currencyCode: currencyCode,
      cultureName: locale,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
    },
  });
  return data.categories;
}
