import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getOrdersQueryDocument from "./getOrdersQuery.graphql";
import type { CustomerOrderConnection, Query, QueryOrdersArgs } from "@/core/api/graphql/types";

export async function getOrders(payload?: QueryOrdersArgs): Promise<CustomerOrderConnection> {
  const { userId, cultureName } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "orders">>, QueryOrdersArgs>({
    query: getOrdersQueryDocument,
    variables: {
      userId,
      cultureName,
      ...payload,
    },
  });

  return data.orders;
}
