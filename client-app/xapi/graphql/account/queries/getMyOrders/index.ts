import { CustomerOrderConnection, Query, QueryOrdersArgs } from "@/xapi/graphql/types";
import getMyOrdersQueryDocument from "./getMyOrdersQuery.graphql";
import globals from "@/core/globals";

export default async function getMyOrders(payload?: QueryOrdersArgs): Promise<CustomerOrderConnection> {
  const { userId, cultureName } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "orders">>, QueryOrdersArgs>({
    query: getMyOrdersQueryDocument,
    variables: {
      userId,
      cultureName,
      ...payload,
    },
  });

  return data.orders;
}
