import { graphqlClient } from "@/core/api/graphql/client";
import { ResumeProductSubscriptionDocument } from "../../types";
import type { InputProductSubscriptionId, ResumeProductSubscriptionMutation } from "../../types";

export async function resumeProductSubscription(
  command: InputProductSubscriptionId,
): Promise<ResumeProductSubscriptionMutation["resumeProductSubscription"]> {
  const { data } = await graphqlClient.mutate({
    mutation: ResumeProductSubscriptionDocument,
    variables: { command },
  });

  return data!.resumeProductSubscription;
}
