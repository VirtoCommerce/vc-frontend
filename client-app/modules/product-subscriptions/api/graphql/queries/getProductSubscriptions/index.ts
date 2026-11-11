import { graphqlClient } from "@/core/api/graphql/client";
import { globals } from "@/core/globals";
import { GetProductSubscriptionsDocument } from "../../types";
import type { GetProductSubscriptionsQuery, GetProductSubscriptionsQueryVariables } from "../../types";

export async function getProductSubscriptions(
  variables: Omit<GetProductSubscriptionsQueryVariables, "storeId">,
): Promise<GetProductSubscriptionsQuery["productSubscriptions"]> {
  const { data } = await graphqlClient.query({
    query: GetProductSubscriptionsDocument,
    variables: { storeId: globals.storeId ?? "", ...variables },
    fetchPolicy: "network-only",
  });

  return data.productSubscriptions;
}
