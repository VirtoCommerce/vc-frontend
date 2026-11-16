import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { SetCartItemSubscriptionDocument } from "../../types";
import type { InputSetCartItemSubscription, SetCartItemSubscriptionMutation } from "../../types";

export async function setCartItemSubscription(
  command: InputSetCartItemSubscription,
): Promise<SetCartItemSubscriptionMutation["setCartItemSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: SetCartItemSubscriptionDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.setCartItemSubscription;
}
