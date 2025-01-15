import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import getBackInStockSubscriptionsQueryDocument from "./getBackInStockSubscriptionsQuery.graphql";
import type { BackInStockSubscriptionQueryConnection, QueryGetBackInStockSubscriptionsArgs } from "../../types";
import type { Query } from "@/core/api/graphql/types";

export async function getBackInStockSubscriptions(
  payload?: QueryGetBackInStockSubscriptionsArgs,
): Promise<BackInStockSubscriptionQueryConnection> {
  const { storeId, userId } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "getBackInStockSubscriptions">>,
    QueryGetBackInStockSubscriptionsArgs
  >({
    query: getBackInStockSubscriptionsQueryDocument,
    variables: {
      storeId,
      userId,
      ...payload,
    },
  });

  return data.getBackInStockSubscriptions;
}
