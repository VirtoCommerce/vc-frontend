import { graphqlClient } from "@/core/api/graphql/client";
import { RemoveCartItemSubscriptionDocument } from "../../types";
import type { InputRemoveCartItemSubscription, RemoveCartItemSubscriptionMutation } from "../../types";

export async function removeCartItemSubscription(
  command: InputRemoveCartItemSubscription,
): Promise<RemoveCartItemSubscriptionMutation["removeCartItemSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: RemoveCartItemSubscriptionDocument,
    variables: { command },
  });

  return data!.removeCartItemSubscription;
}
