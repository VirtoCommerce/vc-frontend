import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { globals } from "@/core/globals";
import { GetProductSubscriptionsDocument } from "../../types";
import type { GetProductSubscriptionsQuery, GetProductSubscriptionsQueryVariables } from "../../types";

export async function getProductSubscriptions(
  variables: Omit<GetProductSubscriptionsQueryVariables, "storeId">,
  options: { suppressErrorNotifications?: boolean } = {},
): Promise<GetProductSubscriptionsQuery["productSubscriptions"]> {
  const { data } = await graphqlClient.query({
    query: GetProductSubscriptionsDocument,
    variables: { storeId: globals.storeId ?? "", cultureName: globals.cultureName, ...variables },
    fetchPolicy: "network-only",
    // A page that shows its own load error asks for no global toast on top of it.
    context: options.suppressErrorNotifications ? SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT : undefined,
  });

  return data.productSubscriptions;
}
