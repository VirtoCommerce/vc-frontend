import globals from "@/core/globals";
import searchCustomerReviewsQueryDocument from "./searchCustomerReviewsQuery.graphql";
import type { CustomerReviewConnection, SearchCustomerReviewsQueryVariables, Query } from "@/xapi/types";

export type SearchCustomerReviewsQueryArgumentsType = Omit<SearchCustomerReviewsQueryVariables, "storeId">;

export async function searchCustomerReviews(
  searchQueryArguments: SearchCustomerReviewsQueryArgumentsType
): Promise<CustomerReviewConnection> {
  const { storeId } = globals;

  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<
    Required<Pick<Query, "customerReviews">>,
    SearchCustomerReviewsQueryVariables
  >({
    query: searchCustomerReviewsQueryDocument,
    variables: {
      storeId,
      ...searchQueryArguments,
    },
  });

  return data.customerReviews!;
}
