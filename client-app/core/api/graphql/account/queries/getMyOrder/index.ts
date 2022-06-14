import client from "@core/api/graphql/graphql-client";
import getMyOrderQueryDocument from "./getMyOrderQuery.graphql";
import { CustomerOrderType, Query, QueryOrderArgs } from "@core/api/graphql/types";
import globals from "@core/globals";

export default async function getMyOrder(payload: QueryOrderArgs): Promise<CustomerOrderType> {
  const { cultureName } = globals;

  const { data } = await client.query<Required<Pick<Query, "order">>, QueryOrderArgs>({
    query: getMyOrderQueryDocument,
    variables: {
      cultureName,
      ...payload,
    },
  });

  return data.order;
}
