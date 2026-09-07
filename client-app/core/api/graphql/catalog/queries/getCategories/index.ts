import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { toValue } from "vue";
import { globals } from "@/core/globals";
import type { Query, QueryCategoriesArgs } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter } from "vue";

const getCategoriesQueryDocument = gql`
  query GetCategories(
    $storeId: String!
    $userId: String
    $cultureName: String
    $currencyCode: String
    $categoryIds: [String]
    $first: Int
  ) {
    categories(
      storeId: $storeId
      userId: $userId
      cultureName: $cultureName
      currencyCode: $currencyCode
      categoryIds: $categoryIds
      first: $first
    ) {
      items {
        id
        name
      }
    }
  }
`;

function getVariables(categoryIds: string[]): QueryCategoriesArgs {
  const { storeId, userId, cultureName, currencyCode } = globals;

  return { storeId, userId, cultureName, currencyCode, categoryIds, first: categoryIds.length };
}

/** Resolves category ids to their localized names. Idle while the id list is empty. */
export function useGetCategories(categoryIds: MaybeRefOrGetter<string[]>) {
  return useQuery<Required<Pick<Query, "categories">>, QueryCategoriesArgs>(
    getCategoriesQueryDocument,
    () => getVariables(toValue(categoryIds)),
    () => ({ enabled: toValue(categoryIds).length > 0 }),
  );
}
