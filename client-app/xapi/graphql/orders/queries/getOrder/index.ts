import globals from "@/core/globals";
import { CustomerOrderType, Query, QueryOrderArgs } from "@/xapi/types";
import getOrderQueryDocument from "./getOrderQuery.graphql";

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
