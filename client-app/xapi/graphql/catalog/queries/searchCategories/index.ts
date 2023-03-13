import globals from "@/core/globals";
import searchCategoriesQueryDocument from "./searchCategoriesQuery.graphql";
import type { CategoryConnection, Query, QueryCategoriesArgs } from "@/xapi/types";

export default async function searchCategories(itemsPerPage: number, page: number): Promise<CategoryConnection> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "categories">>, QueryCategoriesArgs>({
    query: searchCategoriesQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
      filter: "status:visible",
      sort: "name:asc",
    },
  });

  return data.categories;
}
