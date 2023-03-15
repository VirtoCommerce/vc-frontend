import globals from "@/core/globals";
import getOrdersQueryDocument from "./getOrdersQuery.graphql";
import type { CustomerOrderConnection, Query, QueryOrdersArgs } from "@/xapi/types";

export default async function getOrders(payload?: QueryOrdersArgs): Promise<CustomerOrderConnection> {
  const { userId, cultureName } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "orders">>, QueryOrdersArgs>({
    query: getOrdersQueryDocument,
    variables: {
      userId,
      cultureName,
      ...payload,
    },
  });

  return data.orders;
}
