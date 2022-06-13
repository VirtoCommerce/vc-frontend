import client from "@core/api/graphql/graphql-client";
import { CustomerOrderConnection, Query, QueryOrdersArgs } from "@core/api/graphql/types";
import getMyOrdersQueryDocument from "./getMyOrdersQuery.graphql";
import globals from "@core/globals";

export default async function getMyOrders(payload?: QueryOrdersArgs): Promise<CustomerOrderConnection> {
  const { userId, cultureName } = globals;

  const { data } = await client.query<Required<Pick<Query, "orders">>, QueryOrdersArgs>({
    query: getMyOrdersQueryDocument,
    variables: {
      userId,
      cultureName,
      ...payload,
    },
  });

  return data.orders;
}
