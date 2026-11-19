import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { GetOrderSubscriptionInfosDocument } from "../../types";
import type { GetOrderSubscriptionInfosQuery } from "../../types";

/** The subscription marks of a page of the customer's orders, computed on the server. */
export async function getOrderSubscriptionInfos(
  orderIds: string[],
  options: { suppressErrorNotifications?: boolean } = {},
): Promise<GetOrderSubscriptionInfosQuery["orderSubscriptionInfos"]> {
  const { data } = await graphqlClient.query({
    query: GetOrderSubscriptionInfosDocument,
    variables: { orderIds },
    fetchPolicy: "network-only",
    context: options.suppressErrorNotifications ? SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT : undefined,
  });

  return data.orderSubscriptionInfos;
}
