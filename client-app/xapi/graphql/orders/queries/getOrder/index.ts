import globals from "@/core/globals";
import getOrderQueryDocument from "./getOrderQuery.graphql";
import type { CustomerOrderType, Query, QueryOrderArgs } from "@/xapi/types";

export default async function getOrder(payload: QueryOrderArgs): Promise<CustomerOrderType> {
  const { cultureName } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "order">>, QueryOrderArgs>({
    query: getOrderQueryDocument,
    variables: {
      cultureName,
      ...payload,
    },
  });

  return data.order;
}
