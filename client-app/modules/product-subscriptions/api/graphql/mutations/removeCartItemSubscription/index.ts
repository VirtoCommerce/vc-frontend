import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { RemoveCartItemSubscriptionDocument } from "../../types";
import type { InputRemoveCartItemSubscription, RemoveCartItemSubscriptionMutation } from "../../types";

export async function removeCartItemSubscription(
  command: InputRemoveCartItemSubscription,
): Promise<RemoveCartItemSubscriptionMutation["removeCartItemSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: RemoveCartItemSubscriptionDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.removeCartItemSubscription;
}
