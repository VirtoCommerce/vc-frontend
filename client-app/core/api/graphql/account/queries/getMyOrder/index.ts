import client from "@core/api/graphql/graphql-client";
import getMyOrderQueryDocument from "./getMyOrderQuery.graphql";
import { locale } from "@core/constants";
import { CustomerOrderType, Query, QueryOrderArgs } from "@core/api/graphql/types";

export default async function getMyOrder(payload: QueryOrderArgs): Promise<CustomerOrderType> {
  const { data } = await client.query<Required<Pick<Query, "order">>, QueryOrderArgs>({
    query: getMyOrderQueryDocument,
    variables: {
      cultureName: locale,
      ...payload,
    },
  });

  return data.order;
}
