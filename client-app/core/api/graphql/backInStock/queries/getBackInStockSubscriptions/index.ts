import { globals } from "@/core/globals";
import { graphqlClient } from "../../../client";
import getBackInStockSubscriptionsQueryDocument from "./getBackInStockSubscriptionsQuery.graphql";
import type {
  BackInStockSubscriptionQueryConnection,
  Query,
  QueryGetBackInStockSubscriptionsArgs,
} from "../../../types";

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
