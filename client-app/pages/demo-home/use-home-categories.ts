import { gql } from "graphql-tag";
import { ref } from "vue";
import { graphqlClient } from "@/core/api/graphql/client";
import { getSlugInfo } from "@/core/api/graphql/slugInfo";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities/logger";
import type { Category, Query, QueryCategoriesArgs } from "@/core/api/graphql/types";

const homeCategoriesQueryDocument = gql`
  query HomeCategories(
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
        slug
        imgSrc
        description {
          content
        }
        childCategories {
          id
          name
          slug
          imgSrc
        }
      }
    }
  }
`;

// Categories can't be filtered by slug, so each slug is resolved to an id first
async function fetchHomeCategories(slugs: readonly string[]): Promise<Category[]> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const slugInfos = await Promise.all(slugs.map((permalink) => getSlugInfo({ permalink, cultureName })));
  const categoryIds = slugInfos.map((slugInfo) => slugInfo?.entityInfo?.objectId).filter((id): id is string => !!id);

  if (!categoryIds.length) {
    return [];
  }

  const { data } = await graphqlClient.query<Required<Pick<Query, "categories">>, QueryCategoriesArgs>({
    query: homeCategoriesQueryDocument,
    variables: { storeId, userId, cultureName, currencyCode, categoryIds, first: categoryIds.length },
  });

  const items = data.categories.items ?? [];

  return categoryIds
    .map((id) => items.find((category) => category.id === id))
    .filter((category): category is Category => !!category);
}

export function useHomeCategories(slugs: readonly string[]) {
  const categories = ref<Category[]>([]);
  const loading = ref(true);

  fetchHomeCategories(slugs)
    .then((result) => {
      categories.value = result;
    })
    .catch((error) => {
      Logger.error("Failed to load home categories", error);
    })
    .finally(() => {
      loading.value = false;
    });

  return { categories, loading };
}
