import { graphqlClient } from "@/core/api/graphql/client";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { ResumeProductSubscriptionDocument } from "../../types";
import type { InputProductSubscriptionId, ResumeProductSubscriptionMutation } from "../../types";

export async function resumeProductSubscription(
  command: InputProductSubscriptionId,
): Promise<ResumeProductSubscriptionMutation["resumeProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: ResumeProductSubscriptionDocument,
    context: SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    variables: { command },
  });

  return data!.resumeProductSubscription;
}
