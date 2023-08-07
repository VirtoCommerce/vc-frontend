import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getFullOrderQuery from "./getFullOrderQuery.graphql";
import getShortOrderQuery from "./getShortOrderQuery.graphql";
import type { CustomerOrderType, Query, QueryOrderArgs } from "@/core/api/graphql/types";

export type GetOrderPayloadType = Omit<QueryOrderArgs, "cultureName">;

export type GetOrderOptionsType = {
  /** @default false */
  full?: boolean;
};

export default async function getOrder(
  payload: GetOrderPayloadType,
  options: GetOrderOptionsType = {}
): Promise<CustomerOrderType> {
  const { full = false } = options;
  const { cultureName } = globals;

  const { data } = await graphqlClient.query<Required<Pick<Query, "order">>, QueryOrderArgs>({
    query: full ? getFullOrderQuery : getShortOrderQuery,
    variables: {
      cultureName,
      ...payload,
    },
  });

  return data.order;
}
