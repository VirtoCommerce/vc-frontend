import { GetOrdersDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import type { QueryOrdersArgs } from "@/core/api/graphql/types";

export async function getOrders(payload?: QueryOrdersArgs) {
  const { userId, cultureName } = globals;

  const { data } = await graphqlClient.query({
    query: GetOrdersDocument,
    variables: {
      userId,
      cultureName,
      ...payload,
    },
  });

  return data.orders;
}
