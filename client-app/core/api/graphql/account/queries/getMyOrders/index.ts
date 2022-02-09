import client from "@core/api/graphql/graphql-client";
import { CustomerOrderConnection } from "@core/api/graphql/types";
import getMyOrdersQueryDocument from "./getMyOrdersQuery.graphql";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getMyOrders(filter: string, itemsPerPage = 20, page = 1): Promise<CustomerOrderConnection> {
  const { data } = await client.query({
    query: getMyOrdersQueryDocument,
    variables: {
      filter: filter,
      first: itemsPerPage,
      after: String((page - 1) * itemsPerPage),
    },
  });
  return data?.orders;
}
export default getMyOrders;
