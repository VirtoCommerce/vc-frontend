import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getOrderQueryDocument from "./getOrderQuery.graphql";
import type { CustomerOrderType, Query, QueryOrderArgs } from "@/core/api/graphql/types";

export default async function getOrder(payload: QueryOrderArgs): Promise<CustomerOrderType> {
  const { cultureName } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "order">>, QueryOrderArgs>({
    query: getOrderQueryDocument,
    variables: {
      cultureName,
      ...payload,
    },
  });

  return data.order;
}
