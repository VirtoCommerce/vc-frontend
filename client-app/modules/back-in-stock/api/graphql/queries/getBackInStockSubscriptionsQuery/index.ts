import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import getBackInStockSubscriptionsQueryDocument from "./getBackInStockSubscriptionsQuery.graphql";
import type { BackInStockSubscriptionConnection, QueryBackInStockSubscriptionsArgs, Query } from "../../types";

export async function getBackInStockSubscriptions(
  payload?: QueryBackInStockSubscriptionsArgs,
): Promise<BackInStockSubscriptionConnection> {
  const { storeId } = globals;

  const { data } = await graphqlClient.query<
    Required<Pick<Query, "backInStockSubscriptions">>,
    QueryBackInStockSubscriptionsArgs
  >({
    query: getBackInStockSubscriptionsQueryDocument,
    variables: {
      storeId,
      ...payload,
    },
  });

  return data.backInStockSubscriptions;
}
