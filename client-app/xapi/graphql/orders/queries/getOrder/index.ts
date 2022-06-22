import getOrderQueryDocument from "./getOrderQuery.graphql";
import { CustomerOrderType, Query, QueryOrderArgs } from "@/xapi/types";
import globals from "@/core/globals";

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
