import client from "@core/api/graphql/graphql-client";
import { CategoryConnection, Query, QueryCategoriesArgs } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId } from "@core/constants";
import searchCategoriesQueryDocument from "./searchCategoriesQuery.graphql";

export default async function searchCategories(itemsPerPage: number, page: number): Promise<CategoryConnection> {
  const { data } = await client.query<Required<Pick<Query, "categories">>, QueryCategoriesArgs>({
    query: searchCategoriesQueryDocument,
    variables: {
      storeId,
      currencyCode,
      cultureName: locale,
      userId: currentUserId,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
    },
  });

  return data.categories;
}
