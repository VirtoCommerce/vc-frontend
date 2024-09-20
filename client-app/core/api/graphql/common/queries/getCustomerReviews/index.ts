import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getCustomerReviewsDocument from "./getCustomerReviews.graphql";
import type { GetCustomerReviewsQuery, GetCustomerReviewsQueryVariables } from "../../../types";

export async function getCustomerReviews(entityId: string, entityType: string, first: number, after: string) {
  const { storeId } = globals;

  const { data } = await graphqlClient.query<GetCustomerReviewsQuery, GetCustomerReviewsQueryVariables>({
    query: getCustomerReviewsDocument,
    variables: {
      storeId,
      entityId,
      entityType,
      first,
      after,
    },
  });

  return data.customerReviews;
}
