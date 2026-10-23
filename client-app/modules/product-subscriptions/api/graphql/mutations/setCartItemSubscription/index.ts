import { graphqlClient } from "@/core/api/graphql/client";
import { SetCartItemSubscriptionDocument } from "../../types";
import type { InputSetCartItemSubscription, SetCartItemSubscriptionMutation } from "../../types";

export async function setCartItemSubscription(
  command: InputSetCartItemSubscription,
): Promise<SetCartItemSubscriptionMutation["setCartItemSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: SetCartItemSubscriptionDocument,
    variables: { command },
  });

  return data!.setCartItemSubscription;
}
