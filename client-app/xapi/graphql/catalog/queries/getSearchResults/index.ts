import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import globals from "@/core/globals";
import searchQueryDocument from "./getSearchResultsQuery.graphql";
import type { SearchResultsParams } from "@/xapi/graphql/catalog";
import type { GetSearchResultsQueryVariables, Query } from "@/xapi/types";

type SearchResults = Required<Pick<Query, "categories" | "products" | "pages">>;

export default async function getSearchResults({
  keyword,

  products: {
    itemsPerPage: productsItemsPerPage = DEFAULT_PAGE_SIZE,
    page: productsPage = 1,
    sort: productsSort,
    fuzzy: productsFuzzy,
    fuzzyLevel: productsFuzzyLevel,
  } = {},

  categories: {
    itemsPerPage: categoriesItemsPerPage = DEFAULT_PAGE_SIZE,
    page: categoriesPage = 1,
    sort: categoriesSort,
    fuzzy: categoriesFuzzy,
    fuzzyLevel: categoriesFuzzyLevel,
  } = {},

  pages: { page: staticContentPage = 1, itemsPerPage: staticContentItemsPerPage = DEFAULT_PAGE_SIZE } = {},
}: SearchResultsParams): Promise<SearchResults> {
  const { storeId, catalogId, userId, cultureName, currencyCode } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<SearchResults, GetSearchResultsQueryVariables>({
    query: searchQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      productsSort,
      productsFuzzy,
      productsFuzzyLevel,
      categoriesSort,
      categoriesFuzzy,
      categoriesFuzzyLevel,
      query: keyword,
      filter: `category.subtree:${catalogId}`,
      productsFirst: productsItemsPerPage,
      productsAfter: String((productsPage - 1) * productsItemsPerPage),
      categoriesFirst: categoriesItemsPerPage,
      categoriesAfter: String((categoriesPage - 1) * categoriesItemsPerPage),
      pagesFirst: staticContentItemsPerPage,
      pagesAfter: String((staticContentPage - 1) * staticContentItemsPerPage),
    },
  });

  return data;
}
