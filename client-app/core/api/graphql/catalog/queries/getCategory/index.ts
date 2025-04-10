import { useLocalStorage } from "@vueuse/core";
import { gql } from "graphql-tag";
import { getChildCategoriesTreeString } from "@/core/api/graphql/utils";
import { NAVIGATION_OUTLINE } from "@/core/constants";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import type { Query, QueryChildCategoriesArgs } from "@/core/api/graphql/types";
import type { DocumentNode } from "graphql";

function getCategoryQueryDocument(categoryId: string, maxChildCategoriesLevel = 0): DocumentNode {
  const childCategoriesFragment = getChildCategoriesTreeString(maxChildCategoriesLevel);
  const categoryQueryString = categoryId
    ? `
    category(
        storeId: $storeId
        userId: $userId
        cultureName: $cultureName
        currencyCode: $currencyCode
        previousOutline: $previousOutline

        id: "${categoryId}",
    ) {
        id
        name
        slug
        outline
        seoInfo {
            pageTitle
            metaKeywords
            metaDescription
        }
        breadcrumbs {
            title
            seoPath
        }
        parent {
            id
            name
            slug
        }
        images {
            url
        }
    }`
    : "";

  return gql`
    query GetCategory(
      $storeId: String!
      $userId: String
      $cultureName: String
      $currencyCode: String
      $maxLevel: Int
      $onlyActive: Boolean
      $productFilter: String
      $previousOutline: String
    ) {
      ${categoryQueryString}

      childCategories(
        storeId: $storeId
        userId: $userId
        cultureName: $cultureName
        currencyCode: $currencyCode
        maxLevel: $maxLevel
        onlyActive: $onlyActive
        productFilter: $productFilter
        ${categoryId ? `categoryId: "${categoryId}"` : ""}
      ) {
        __typename
        ${childCategoriesFragment}
      }
    }
  `;
}

export type ExtendedQueryCategoryArgsType = QueryChildCategoriesArgs;

export async function getCategory(payload: Omit<ExtendedQueryCategoryArgsType, "storeId">) {
  const { storeId, userId, cultureName, currencyCode } = globals;
  const navigationOutline = useLocalStorage<string>(NAVIGATION_OUTLINE, "");

  const queryDocument = getCategoryQueryDocument(payload.categoryId ?? "", payload.maxLevel);

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "category" | "childCategories">>,
    ExtendedQueryCategoryArgsType
  >({
    query: queryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      previousOutline: navigationOutline.value,
      ...payload,
    },
  });

  if (data?.category?.outline) {
    navigationOutline.value = data.category.outline;
  }

  return data;
}
