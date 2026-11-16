import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { PauseProductSubscriptionDocument } from "../../types";
import type { InputPauseProductSubscription, PauseProductSubscriptionMutation } from "../../types";

export async function pauseProductSubscription(
  command: InputPauseProductSubscription,
): Promise<PauseProductSubscriptionMutation["pauseProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: PauseProductSubscriptionDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.pauseProductSubscription;
}
