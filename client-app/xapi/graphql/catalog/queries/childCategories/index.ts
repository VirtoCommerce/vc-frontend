import { DocumentNode } from "graphql";
import { gql } from "graphql-tag";
import globals from "@/core/globals";
import { Category, Query, QueryChildCategoriesArgs } from "@/xapi/types";

function getQueryResponseTree(level: number): string {
  const newLevel = level - 1;

  if (newLevel >= 0) {
    return `
      childCategories {
        id
        name
        level
        slug
        parent {
          id
        }
        seoInfo {
          pageTitle
          metaKeywords
          metaDescription
        }
        breadcrumbs {
          title
          seoPath
        }
        ${getQueryResponseTree(newLevel)}
      }
    `;
  }

  return "";
}

function getChildCategoriesFragment(maxLevel: number): DocumentNode {
  const tree: string = getQueryResponseTree(maxLevel);

  return gql`
    fragment childCategoriesFields on ChildCategoriesQueryResponseType {
      ${tree}
    }
  `;
}

function getQueryDocument(maxLevel: number): DocumentNode {
  const childCategorisFragment = getChildCategoriesFragment(maxLevel);

  const query: DocumentNode = gql`
    ${childCategorisFragment}
    query ChildCategories(
      $storeId: String
      $userId: String
      $cultureName: String
      $currencyCode: String
      $categoryId: String
      $maxLevel: Int
      $onlyActive: Boolean
    ) {
      childCategories(
        storeId: $storeId
        userId: $userId
        cultureName: $cultureName
        currencyCode: $currencyCode
        categoryId: $categoryId
        maxLevel: $maxLevel
        onlyActive: $onlyActive
      ) {
        ...childCategoriesFields
      }
    }
  `;

  return query;
}

export default async function getChildCategories(payload: QueryChildCategoriesArgs): Promise<Category[]> {
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
