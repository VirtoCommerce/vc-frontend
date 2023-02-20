import globals from "@/core/globals";
import { CustomerOrderConnection, Query, QueryOrdersArgs } from "@/xapi/types";
import getOrdersQueryDocument from "./getOrdersQuery.graphql";

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
