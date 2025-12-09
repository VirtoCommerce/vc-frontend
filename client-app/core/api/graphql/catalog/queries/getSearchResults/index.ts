import { ApolloError } from "@apollo/client/core";
import { AbortReason } from "@/core/api/common/enums";
import { graphqlClient } from "@/core/api/graphql/client";
import { GetSearchResultsDocument } from "@/core/api/graphql/types";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { DEFAULT_PAGE_SIZE } from "@/core/constants";
import { MODULE_ID_VIRTOPAGES, VIRTOPAGES_ENABLED_KEY } from "@/core/constants/modules";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities/logger";
import type { GetSearchResultsQueryVariables } from "@/core/api/graphql/types";

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

let abortController: AbortController | undefined;

export async function getSearchResults(params: GetSearchResultsParamsType) {
  const { storeId, userId, cultureName, currencyCode } = globals;

  const { isEnabled: virtoPagesEnabled } = useModuleSettings(MODULE_ID_VIRTOPAGES);
  const isVirtoPagesEnabled = virtoPagesEnabled(VIRTOPAGES_ENABLED_KEY);

  const withSuggestions = !!params.productSuggestions;
  const withPages = !!params.pages && !isVirtoPagesEnabled;
  const withVirtoPages = !!params.pages && isVirtoPagesEnabled;
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
    withVirtoPages,
    withSuggestions,
    query: keyword,
    filter,
  };

  if (withSuggestions) {
    Object.assign(variables, <GetSearchResultsQueryVariables>{
      suggestionsSize: productSuggestionsSize,
    });
  }

  if (withPages || withVirtoPages) {
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

  if (abortController) {
    abortController.abort(AbortReason.Explicit);
  }

  abortController = new AbortController();
  const { signal } = abortController;

  try {
    const { data } = await graphqlClient.query({
      query: GetSearchResultsDocument,
      variables,
      context: {
        fetchOptions: { signal },
      },
    });

    return {
      productSuggestions: data.productSuggestions ?? {},
      pages: data.pages ?? data.pageDocuments ?? {},
      categories: data.categories ?? {},
      products: data.products ?? {},
    };
  } catch (e) {
    if (e instanceof ApolloError && e.networkError?.toString() === (AbortReason.Explicit as string)) {
      return;
    }
    Logger.error(`${getSearchResults.name}`, e);
    throw e;
  }
}
