import getMyOrderQueryDocument from "./getMyOrderQuery.graphql";
import { CustomerOrderType, Query, QueryOrderArgs } from "@/xapi/graphql/types";
import globals from "@/core/globals";

export default async function getMyOrder(payload: QueryOrderArgs): Promise<CustomerOrderType> {
  const { cultureName } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "order">>, QueryOrderArgs>({
    query: getMyOrderQueryDocument,
    variables: {
      cultureName,
      ...payload,
    },
  });

  return data.order;
}
