import { DocumentNode } from "graphql";
import { gql } from "graphql-tag";
import globals from "@/core/globals";
import { Query, QueryChildCategoriesArgs } from "@/xapi/types";

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

function getResponseTreeDocumentNode(maxLevel: number): DocumentNode {
  let tree = "";
  tree += getQueryResponseTree(maxLevel);

  return gql`
    fragment childCategories on ChildCategoriesQueryResponseType {
      ${tree}
    }
  `;
}

function getQueryDocument(maxLevel: number): DocumentNode {
  const responseTree = getResponseTreeDocumentNode(maxLevel);

  const query: DocumentNode = gql`
    ${responseTree}
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
        ...childCategories
      }
    }
  `;

  return query;
}

export default async function childCategories(maxLevel: number, onlyActive: boolean, categoryId?: string) {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "childCategories">>, QueryChildCategoriesArgs>({
    query: getQueryDocument(maxLevel),
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      categoryId,
      maxLevel,
      onlyActive,
    },
  });

  return data.childCategories;
}
