import globals from "@/core/globals";
import { Category, Query, QueryCategoryArgs } from "@/xapi/types";
import getCategoryQueryDocument from "./getCategoryQuery.graphql";

export default async function getCategory(id: string): Promise<Category | undefined> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "category">>, QueryCategoryArgs>({
    query: getCategoryQueryDocument,
    variables: {
      id,
      storeId,
      userId,
      cultureName,
      currencyCode,
    },
  });

  return data.category;
}
