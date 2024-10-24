import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import getCustomerReviewsDocument from "./getCustomerReviewsQuery.graphql";
import type { GetCustomerReviewsQuery, GetCustomerReviewsQueryVariables } from "../../types";

export async function getCustomerReviews(payload: {
  entityId: string;
  entityType: string;
  first: number;
  after: string;
  sort: string;
}) {
  const { storeId } = globals;

  const { data } = await graphqlClient.query<GetCustomerReviewsQuery, GetCustomerReviewsQueryVariables>({
    query: getCustomerReviewsDocument,
    variables: {
      storeId,
      entityId: payload.entityId,
      entityType: payload.entityType,
      first: payload.first,
      after: payload.after,
      sort: payload.sort,
    },
  });

  return data.customerReviews;
}
