import { GetFullOrderDocument, GetShortOrderDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import type { GetFullOrderQueryVariables, GetShortOrderQueryVariables } from "@/core/api/graphql/types";

export async function getFullOrder(payload: GetFullOrderQueryVariables) {
  const { data } = await graphqlClient.query({
    query: GetFullOrderDocument,
    variables: {
      ...payload,
      cultureName: globals.cultureName,
    },
  });

  return data.order;
}

export async function getShortOrder(payload: GetShortOrderQueryVariables) {
  const { data } = await graphqlClient.query({
    query: GetShortOrderDocument,
    variables: {
      ...payload,
      cultureName: globals.cultureName,
    },
  });

  return data.order;
}
