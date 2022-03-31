import client from "@core/api/graphql/graphql-client";
import { CustomerOrderConnection, CustomerOrderType, QueryOrdersArgs } from "@core/api/graphql/types";
import getMyOrdersQueryDocument from "./getMyOrdersQuery.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getMyOrders(variables?: QueryOrdersArgs): Promise<CustomerOrderConnection> {
  const { data } = await client.query({
    query: getMyOrdersQueryDocument,
    variables,
  });
  return data?.orders;
}
export default getMyOrders;
