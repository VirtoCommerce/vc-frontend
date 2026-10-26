import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { CancelProductSubscriptionDocument } from "../../types";
import type { InputCancelProductSubscription, CancelProductSubscriptionMutation } from "../../types";

export async function cancelProductSubscription(
  command: InputCancelProductSubscription,
): Promise<CancelProductSubscriptionMutation["cancelProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: CancelProductSubscriptionDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.cancelProductSubscription;
}
