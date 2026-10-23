import { graphqlClient } from "@/core/api/graphql/client";
import { CancelProductSubscriptionDocument } from "../../types";
import type { InputCancelProductSubscription, CancelProductSubscriptionMutation } from "../../types";

export async function cancelProductSubscription(
  command: InputCancelProductSubscription,
): Promise<CancelProductSubscriptionMutation["cancelProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: CancelProductSubscriptionDocument,
    variables: { command },
  });

  return data!.cancelProductSubscription;
}
