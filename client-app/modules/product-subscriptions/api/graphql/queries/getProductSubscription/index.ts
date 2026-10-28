import { graphqlClient } from "@/core/api/graphql/client";
import { GetProductSubscriptionDocument } from "../../types";
import type { GetProductSubscriptionQuery } from "../../types";

export async function getProductSubscription(id: string): Promise<GetProductSubscriptionQuery["productSubscription"]> {
  const { data } = await graphqlClient.query({
    query: GetProductSubscriptionDocument,
    variables: { id },
    fetchPolicy: "network-only",
  });

  return data.productSubscription;
}
