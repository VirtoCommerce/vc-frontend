import client from "@core/api/graphql/graphql-client";
import { GetSearchResultsQueryVariables, Query } from "@core/api/graphql/types";
import { currencyCode, currentUserId, locale, storeId, catalogId, defaultPageSize } from "@core/constants";
import searchQueryDocument from "./getSearchResultsQuery.graphql";
import { SearchResultsParams } from "@core/api/graphql/catalog";

type SearchResults = Required<Pick<Query, "categories" | "products">>;

export default async function getSearchResults({
  keyword,

  products: {
    itemsPerPage: productsItemsPerPage = defaultPageSize,
    page: productsPage = 1,
    sort: productsSort,
    fuzzy: productsFuzzy,
    fuzzyLevel: productsFuzzyLevel,
  } = {},

  categories: {
    itemsPerPage: categoriesItemsPerPage = defaultPageSize,
    page: categoriesPage = 1,
    sort: categoriesSort,
    fuzzy: categoriesFuzzy,
    fuzzyLevel: categoriesFuzzyLevel,
  } = {},
}: SearchResultsParams): Promise<SearchResults> {
  const { data } = await client.query<SearchResults, GetSearchResultsQueryVariables>({
    query: searchQueryDocument,
    variables: {
      storeId,
      productsSort,
      productsFuzzy,
      productsFuzzyLevel,
      categoriesSort,
      categoriesFuzzy,
      categoriesFuzzyLevel,
      query: keyword,
      cultureName: locale,
      userId: currentUserId,
      currencyCode: currencyCode,
      filter: `category.subtree:${catalogId}`,
      productsFirst: productsItemsPerPage,
      productsAfter: String((productsPage - 1) * productsItemsPerPage),
      categoriesFirst: categoriesItemsPerPage,
      categoriesAfter: String((categoriesPage - 1) * categoriesItemsPerPage),
    },
  });

  return data;
}
