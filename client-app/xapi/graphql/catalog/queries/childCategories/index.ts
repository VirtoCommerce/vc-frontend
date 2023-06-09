import { gql } from "graphql-tag";
import globals from "@/core/globals";
import { getChildCategoriesTreeString } from "@/xapi/utils";
import type { Category, Query, QueryChildCategoriesArgs } from "@/xapi/types";
import type { DocumentNode } from "graphql";

function getQueryDocument(maxLevel: number): DocumentNode {
  const childCategoriesFragment = getChildCategoriesTreeString(maxLevel);

  return gql`
    query ChildCategories(
      $storeId: String
      $userId: String
      $cultureName: String
      $currencyCode: String
      $categoryId: String
      $maxLevel: Int
      $onlyActive: Boolean
      $productFilter: String
    ) {
      childCategories(
        storeId: $storeId
        userId: $userId
        cultureName: $cultureName
        currencyCode: $currencyCode
        categoryId: $categoryId
        maxLevel: $maxLevel
        onlyActive: $onlyActive
        productFilter: $productFilter
      ) {
        __typename
        ${childCategoriesFragment}
      }
    }
  `;
}

export async function getChildCategories(payload: QueryChildCategoriesArgs): Promise<Category[]> {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "childCategories">>, QueryChildCategoriesArgs>({
    query: getQueryDocument(payload.maxLevel!),
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      ...payload,
    },
  });

  return data.childCategories.childCategories ?? [];
}
