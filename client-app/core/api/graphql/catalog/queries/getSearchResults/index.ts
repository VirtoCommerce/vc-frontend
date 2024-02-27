import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import { GetSearchResultsDocument } from "./getSearchResultsQuery.generated";
import type { GetSearchResultsQueryVariables } from "./getSearchResultsQuery.generated";
import type { Query } from "@/core/api/graphql/types";

export type SearchResultsType = Required<Pick<Query, "categories" | "products" | "pages" | "productSuggestions">>;

export type GetSearchResultsParamsType = {
  keyword: string;
  filter?: string;

  productSuggestions?: {
    suggestionsSize?: number;
  };

  pages?: {
    page?: number;
    itemsPerPage?: number;
  };

  categories?: {
    page?: number;
    itemsPerPage?: number;
    sort?: string;
    fuzzy?: boolean;
    fuzzyLevel?: number;
  };

  products?: {
    page?: number;
    itemsPerPage?: number;
    sort?: string;
    fuzzy?: boolean;
    fuzzyLevel?: number;
  };
};

export async function getSearchResults(params: GetSearchResultsParamsType): Promise<SearchResultsType> {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const withSuggestions = !!params.productSuggestions;
  const withPages = !!params.pages;
  const withCategories = !!params.categories;
  const withProducts = !!params.products;

  const {
    keyword,
    filter,

    productSuggestions: { suggestionsSize: productSuggestionsSize = DEFAULT_PAGE_SIZE } = {},

    pages: { page: staticContentPage = 1, itemsPerPage: staticContentItemsPerPage = DEFAULT_PAGE_SIZE } = {},

    categories: {
      itemsPerPage: categoriesItemsPerPage = DEFAULT_PAGE_SIZE,
      page: categoriesPage = 1,
      sort: categoriesSort,
      fuzzy: categoriesFuzzy,
      fuzzyLevel: categoriesFuzzyLevel,
    } = {},

    products: {
      itemsPerPage: productsItemsPerPage = DEFAULT_PAGE_SIZE,
      page: productsPage = 1,
      sort: productsSort,
      fuzzy: productsFuzzy,
      fuzzyLevel: productsFuzzyLevel,
    } = {},
  } = params;

  const variables: GetSearchResultsQueryVariables = {
    storeId,
    userId,
    cultureName,
    currencyCode,
    withProducts,
    withCategories,
    withPages,
    withSuggestions,
    query: keyword,
    filter,
  };

  if (withSuggestions) {
    Object.assign(variables, <GetSearchResultsQueryVariables>{
      suggestionsSize: productSuggestionsSize,
    });
  }

  if (withPages) {
    Object.assign(variables, <GetSearchResultsQueryVariables>{
      pagesFirst: staticContentItemsPerPage,
      pagesAfter: String((staticContentPage - 1) * staticContentItemsPerPage),
    });
  }

  if (withCategories) {
    Object.assign(variables, <GetSearchResultsQueryVariables>{
      categoriesSort,
      categoriesFuzzy,
      categoriesFuzzyLevel,
      categoriesFirst: categoriesItemsPerPage,
      categoriesAfter: String((categoriesPage - 1) * categoriesItemsPerPage),
    });
  }

  if (withProducts) {
    Object.assign(variables, <GetSearchResultsQueryVariables>{
      productsSort,
      productsFuzzy,
      productsFuzzyLevel,
      productsFirst: productsItemsPerPage,
      productsAfter: String((productsPage - 1) * productsItemsPerPage),
    });
  }

  const { data } = await graphqlClient.query<SearchResultsType, GetSearchResultsQueryVariables>({
    query: GetSearchResultsDocument,
    variables,
  });

  return Object.assign(
    {
      productSuggestions: {},
      pages: {},
      categories: {},
      products: {},
    },
    data,
  );
}
