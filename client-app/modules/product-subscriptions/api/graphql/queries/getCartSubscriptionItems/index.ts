import { graphqlClient } from "@/core/api/graphql/client";
import { GetCartSubscriptionItemsDocument } from "../../types";
import type { GetCartSubscriptionItemsQuery } from "../../types";

export async function getCartSubscriptionItems(
  cartId: string,
): Promise<GetCartSubscriptionItemsQuery["cartSubscriptionItems"]> {
  const { data } = await graphqlClient.query({
    query: GetCartSubscriptionItemsDocument,
    variables: { cartId },
    fetchPolicy: "network-only",
  });

  return data.cartSubscriptionItems;
}
