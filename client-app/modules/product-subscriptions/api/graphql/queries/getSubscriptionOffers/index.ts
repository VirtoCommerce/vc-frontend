import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetSubscriptionOffersDocument } from "../../types";
import type { GetSubscriptionOffersQuery } from "../../types";

export async function getSubscriptionOffers(
  productIds: string[],
): Promise<GetSubscriptionOffersQuery["subscriptionOffers"]> {
  const { data } = await graphqlClient.query({
    query: GetSubscriptionOffersDocument,
    variables: { storeId: globals.storeId ?? "", productIds },
    fetchPolicy: "network-only",
  });

  return data.subscriptionOffers;
}
