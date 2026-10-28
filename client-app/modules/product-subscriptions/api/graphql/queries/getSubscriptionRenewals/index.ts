import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetSubscriptionRenewalsDocument } from "../../types";
import type { GetSubscriptionRenewalsQuery, GetSubscriptionRenewalsQueryVariables } from "../../types";

export async function getSubscriptionRenewals(
  variables: Omit<GetSubscriptionRenewalsQueryVariables, "storeId">,
): Promise<GetSubscriptionRenewalsQuery["subscriptionRenewals"]> {
  const { data } = await graphqlClient.query({
    query: GetSubscriptionRenewalsDocument,
    variables: { storeId: globals.storeId ?? "", ...variables },
    fetchPolicy: "network-only",
  });

  return data.subscriptionRenewals;
}
