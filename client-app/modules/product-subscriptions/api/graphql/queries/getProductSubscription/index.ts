import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { GetProductSubscriptionDocument } from "../../types";
import type { GetProductSubscriptionQuery } from "../../types";

export async function getProductSubscription(
  id: string,
  options: { suppressErrorNotifications?: boolean } = {},
): Promise<GetProductSubscriptionQuery["productSubscription"]> {
  const { data } = await graphqlClient.query({
    query: GetProductSubscriptionDocument,
    variables: { id, cultureName: globals.cultureName },
    fetchPolicy: "network-only",
    // A page that shows its own load error asks for no global toast on top of it.
    context: options.suppressErrorNotifications ? SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT : undefined,
  });

  return data.productSubscription;
}
