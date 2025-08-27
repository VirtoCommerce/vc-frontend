import { useLocalStorage } from "@vueuse/core";
import { DEFAULT_PAGE_SIZE, NAVIGATION_OUTLINE } from "@/core/constants";
import { globals } from "@/core/globals";
import { getFilterExpressionForCategorySubtree, getFilterExpressionForZeroPrice } from "@/core/utilities";
import { graphqlClient } from "../../../client";
import searchProductsQueryDocument from "./searchProductsQuery.graphql";
import type { ProductConnection, Query, QueryProductsArgs } from "@/core/api/graphql/types";
import type { ProductsSearchParamsType } from "@/shared/catalog";

export async function searchProducts(
  {
    itemsPerPage = DEFAULT_PAGE_SIZE,
    page = 1,
    categoryId,
    filter,
    sort,
    keyword,
    fuzzy,
    fuzzyLevel,
    productIds,
    selectedAddressId,
    selectedAddress,
    preserveUserQuery,
  }: Partial<ProductsSearchParamsType>,
  options: {
    /** @default false */
    withFacets?: boolean;
    /** @default true */
    withImages?: boolean;
    /** @default false */
    withZeroPrice?: boolean;
  } = {},
): Promise<ProductConnection> {
  const { storeId, catalogId, userId, cultureName, currencyCode } = globals;
  const { withFacets = false, withImages = true, withZeroPrice = false } = options;
  const slugOutline = useLocalStorage<string>(NAVIGATION_OUTLINE, "");

  const filterString = [
    getFilterExpressionForCategorySubtree({ catalogId, categoryId }),
    getFilterExpressionForZeroPrice(withZeroPrice, currencyCode),
    filter,
  ]
    .filter(Boolean)
    .join(" ");

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "products">>,
    QueryProductsArgs & { withFacets: boolean; withImages: boolean }
  >({
    query: searchProductsQueryDocument,
    variables: {
      storeId,
      userId,
      cultureName,
      currencyCode,
      sort,
      fuzzy,
      fuzzyLevel,
      withFacets,
      withImages,
      query: keyword,
      filter: filterString,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
      productIds,
      selectedAddressId,
      selectedAddress,
      preserveUserQuery,
      previousOutline: slugOutline.value,
    },
  });

  return data.products;
}
