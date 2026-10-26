import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { SkipProductSubscriptionDocument } from "../../types";
import type { InputProductSubscriptionId, SkipProductSubscriptionMutation } from "../../types";

export async function skipProductSubscription(
  command: InputProductSubscriptionId,
): Promise<SkipProductSubscriptionMutation["skipProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: SkipProductSubscriptionDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.skipProductSubscription;
}
