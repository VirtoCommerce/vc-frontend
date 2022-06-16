import { CategoryConnection, Query, QueryCategoriesArgs } from "@/xapi/graphql/types";
import searchCategoriesQueryDocument from "./searchCategoriesQuery.graphql";
import globals from "@core/globals";

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
    },
  });

  return data.categories;
}
