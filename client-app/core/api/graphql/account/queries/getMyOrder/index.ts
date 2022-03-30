import client from "@core/api/graphql/graphql-client";
import getMyOrderQueryDocument from "./getMyOrderQuery.graphql";
import { locale } from "@core/constants";
import { CustomerOrderType } from "@core/api/graphql/types";

async function getMyOrder(id?: string, number?: string): Promise<CustomerOrderType> {
  const { data } = await client.query({
    query: getMyOrderQueryDocument,
    variables: {
      id: id,
      number: number,
      cultureName: locale,
    },
  });
  return data?.order;
}
export default getMyOrder;
